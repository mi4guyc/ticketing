import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";


// // replace NATS Service with mock to remove dependency on NATS
// jest.mock("../../nats-wrapper");

// it("", async () => {});
it("404 if ticket Id does not exist", async () => {
  // create dummy id from mongoose
  const id = new mongoose.Types.ObjectId().toHexString();

  // Authenticated put with valid data, but bad ID
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "Good",
      price: 10.0, // Good price
    })
    .expect(404);
});

it("401 if not authenticated", async () => {
  // create dummy id from mongoose
  const id = new mongoose.Types.ObjectId().toHexString();

  // Authenticated put with valid data, but bad ID
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "Good",
      price: 10.0, // Good price
    })
    .expect(401);
});

it("401 if not owner of ticket", async () => {
  // Build a ticket using the updated random ID generator for userid
  const responseFromCreate = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Good",
      price: 10.0, // Good price
    })
    .expect(201);

  // Authenticated put with valid data, but bad (random) ID
  await request(app)
    .put(`/api/tickets/${responseFromCreate.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "Good",
      price: 11.0, // Good price
    })
    .expect(401);
});
it("400 if invalid price or title", async () => {
  // Random ID in this version
  const signinCookie = global.signin();

  // Build a ticket using the updated random ID generator for userid
  const responseFromCreate = await request(app)
    .post("/api/tickets")
    .set("Cookie", signinCookie)
    .send({
      title: "Good",
      price: 10.0, // Good price
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${responseFromCreate.body.id}`)
    .set("Cookie", signinCookie)
    .send({
      title: "Good",
      // Good price
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${responseFromCreate.body.id}`)
    .set("Cookie", signinCookie)
    .send({
      title: "Good",
      price: -11.0,
    })
    .expect(400);
});

it("updates ticket with valid ticket", async () => {
  // Random ID in this version
  const signinCookie = global.signin();

  // Build a ticket using the updated random ID generator for userid
  const responseFromCreate = await request(app)
    .post("/api/tickets")
    .set("Cookie", signinCookie)
    .send({
      title: "Good",
      price: 10.0, // Good price
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${responseFromCreate.body.id}`)
    .set("Cookie", signinCookie)
    .send({
      title: "Good",
      price: 11.0,
    })
    .expect(200);

  await request(app)
    .put(`/api/tickets/${responseFromCreate.body.id}`)
    .set("Cookie", signinCookie)
    .send({
      title: "Good1",
      price: 11.0,
    })
    .expect(200);

  const updatedResponse = await request(app)
    .get(`/api/tickets/${responseFromCreate.body.id}`)
    .set("Cookie", signinCookie)
    .expect(200);
  const { price, title } = updatedResponse.body;
  // console.log("returned ticket: ", price, title);
  expect(updatedResponse.body.title).toEqual("Good1");
  expect(updatedResponse.body.price).toEqual(11);
});

it("updates ticket generates event", async () => {
  // Random ID in this version
  const signinCookie = global.signin();

  // Build a ticket using the updated random ID generator for userid
  const responseFromCreate = await request(app)
    .post("/api/tickets")
    .set("Cookie", signinCookie)
    .send({
      title: "Good",
      price: 10.0, // Good price
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${responseFromCreate.body.id}`)
    .set("Cookie", signinCookie)
    .send({
      title: "Good",
      price: 11.0,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if ticket reserved", async () => {
   // Random ID in this version
   const someId = new mongoose.Types.ObjectId().toHexString();
   const signinCookie = global.signin();

   // Build a ticket using the updated random ID generator for userid
   const responseFromCreate = await request(app)
     .post("/api/tickets")
     .set("Cookie", signinCookie)
     .send({
       title: "Good",
       price: 10.0, // Good price
     })
     .expect(201);
 
     const ticket = await Ticket.findById(responseFromCreate.body.id);
     ticket!.set({orderId: someId});
     await ticket!.save();

   await request(app)
     .put(`/api/tickets/${responseFromCreate.body.id}`)
     .set("Cookie", signinCookie)
     .send({
       title: "Good",
       price: 11.0,
     })
     .expect(400);
 
   expect(natsWrapper.client.publish).toHaveBeenCalled();
});