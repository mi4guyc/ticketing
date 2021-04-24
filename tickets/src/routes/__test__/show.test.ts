import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

// // replace NATS Service with mock to remove dependency on NATS
// jest.mock("../../nats-wrapper");

it("returns a 404 if ticket not found", async () => {
  // create dummy id from mongoose
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns the ticket if ticket found", async () => {
  const title = "My test";
  const price = 10.0;

  //create a ticket in database
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
