import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/orders";
import { OrderStatus } from "@mi3guyc/common";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment";

// import { stripe } from "../../stripe";

// Mock the strip API
// jest.mock("../../stripe");

it("404 for no order match", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "sldkfjsalj",
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});
// _id: attrs.id,
//     version: attrs.version,
//     price: attrs.price,
//     userId: attrs.userId,
//     status: attrs.status,
it("401 purchase order not belonging to user", async () => {
  const order = Order.build({
    userId: "test@test.com",
    version: 0,
    price: 10.0,
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
  });
  await order.save();

  //  console.log("Order ID: test@test.com - Cookie ID: ", global.signin());

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(401);
});
it("400 purchase cancelled order", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    userId: userId,
    version: 0,
    price: 10.0,
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const price = Math.floor(Math.random() * 100000);
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: price,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  //  Get ten most recent charges recorded in stripe
  const stripeRecords = await stripe.charges.list({
    limit: 3,
  });
  // console.log(stripeRecords);
  // Find a charge = price match in the Stripe data records
  const stripeCharge = stripeRecords.data.find((charge) => {
    return charge.amount === price * 100;
  });
  // console.log("Found Match!", stripeCharge);
  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.amount).toEqual(price * 100);

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });
  // if (payment) {
  //   console.log("Found record: ", payment.orderId, payment.stripeId);
  // }
  // Special case for 'findOne' that returns null rather than undefined
  expect(payment).not.toBeNull();
});
