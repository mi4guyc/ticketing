import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/orders";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { OrderStatus } from "@mi3guyc/common";

it("returns an error if no ticket", async () => {
  const ticketId = mongoose.Types.ObjectId();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId })
    .expect(404);
});
it("returns an error if ticket reserved", async () => {
  const ticket = Ticket.build({
    title: "concert #1",
    price: 21.22,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const order = Order.build({
    userId: "my dummy userid",
    status: OrderStatus.Created,
    ticket: ticket,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = Ticket.build({
    title: "concert #2",
    price: 21.0,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it("emits an order creation event", async () => {
  const ticket = Ticket.build({
    title: "concert #2",
    price: 21.0,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
