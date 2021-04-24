import express, { Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Ticket } from "../models/ticket";
import { Order } from "../models/orders";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@mi3guyc/common";

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

const router = express.Router();

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    // Find the ticket
    const ticket = await Ticket.findById(ticketId);

    // Not found
    if (!ticket) {
      throw new NotFoundError();
    }

    // Check if available to purchase (see if it in process = everything other than Cancelled

    //Found someone working on ticket already
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket already reserved");
    }
    // Calculate expiration date to buy
    const expirationTime = new Date();
    expirationTime.setSeconds(
      expirationTime.getSeconds() + EXPIRATION_WINDOW_SECONDS
    );

    // Build the order and save to database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expirationTime,
      ticket: ticket,
    });

    await order.save();

    // Send off for payment via an event
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
