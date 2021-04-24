import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

// // replace NATS Service with mock to remove dependency on NATS
// jest.mock("../../nats-wrapper");

it("can fetch a lot of tickets", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Good1",
      price: 10.0, // Good price
    })
    .expect(201);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Good2",
      price: 10.0, // Good price
    })
    .expect(201);

  const response = await request(app).get("/api/tickets").send().expect(200);
  // console.log(response.body);
  expect(response.body.length).toEqual(2);
});
