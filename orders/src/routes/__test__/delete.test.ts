import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/orders";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { OrderStatus } from "@mi3guyc/common";

const buildTicket = async () => {
  // Create record for database
  const ticket = Ticket.build({
    title: "concert #2",
    price: 21.0,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  // Save to DB
  await ticket.save();

  return ticket;
};

it("deletes order for a specific user", async () => {
  const ticketOne = await buildTicket();
  const userOne = global.signin();

  // Create one order as User
  const { body: createOrder } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // Try to fetch get orders for User
  const { body: deletedOrder } = await request(app)
    .delete(`/api/orders/${createOrder.id}`)
    .set("Cookie", userOne)
    .expect(204);

  const updatedOrder = await Order.findById(createOrder.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("delete wrong users order", async () => {
  const ticketOne = await buildTicket();
  const userOne = global.signin();

  // Create one order as User #1
  const { body: createOrder } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // Try to delete get orders for different user
  const { body: deletedOrder } = await request(app)
    .delete(`/api/orders/${createOrder.id}`)
    .set("Cookie", global.signin())
    .expect(401);
});

it("send a message on cancel", async () => {
  const ticketOne = await buildTicket();
  const userOne = global.signin();

  // Create one order as User
  const { body: createOrder } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // Try to fetch get orders for User
  const { body: deletedOrder } = await request(app)
    .delete(`/api/orders/${createOrder.id}`)
    .set("Cookie", userOne)
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
