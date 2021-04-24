import express, { Request, Response } from "express";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { Payment } from "../models/payment";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from "@mi3guyc/common/build";
import { Order } from "../models/orders";
import { stripe } from "../stripe";
// import { OrderCreatedPublisher } from "../../../orders/src/events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

// Stripe API Test Creds
// Secret: sk_test_51Iig76J1UEE1Z8UcGqeZThyVXNy1VPv8nSAqiaiyzEp6LqoS2zxmxHwlwjjgcalh75K3sgcYhQGE81IMVkrb2laz00KuNEkoxP
// Publishable: pk_test_51Iig76J1UEE1Z8UcCaG5zvNt1OvHYFi9b1aIUnvVjTNYnYtEKO1elpam6rsZaORVWSixZeRJqiGKz974Ez24JzKR00mEJHTnuj

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Order cancelled - cannot pay for ticket");
    }

    // Create the charge on Stripe (pennies based)
    // const stripe1 = require("stripe")(
    //   "sk_test_51Iig76J1UEE1Z8UcGqeZThyVXNy1VPv8nSAqiaiyzEp6LqoS2zxmxHwlwjjgcalh75K3sgcYhQGE81IMVkrb2laz00KuNEkoxP"
    // );
    // console.log("before stripe");
    // console.log(process.env.STRIPE_KEY);
    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
      description: `Tickets test order from ID: ${order.userId}`,
    });
    // console.log("after stripe");
    // console.log(charge);
    // Record our Stripe transaction record
    const payment = Payment.build({
      orderId: orderId,
      stripeId: charge.id,
    });
    await payment.save();

    // Send off for payment via an event
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    //Testing for pass thru to this point
    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
