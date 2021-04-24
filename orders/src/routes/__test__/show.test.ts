import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/orders";
import mongoose from "mongoose";
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

it("fetches orders for a specific user", async () => {
  const ticketOne = await buildTicket();
  const userOne = global.signin();

  // Create one order as User #1
  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // console.log(orderOne.id);

  // Try to fetch get orders for User #2
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${orderOne.id}`)
    .set("Cookie", userOne)
    .expect(200);

  expect(fetchedOrder.id).toEqual(orderOne.id);
});

it("fetches wrong users order", async () => {
  const ticketOne = await buildTicket();
  const userOne = global.signin();

  // Create one order as User #1
  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // console.log(orderOne.id);

  // Try to fetch get orders for User #2
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${orderOne.id}`)
    .set("Cookie", global.signin())
    .expect(401);

  // expect(fetchedOrder.id).toEqual(orderOne.id);
});
