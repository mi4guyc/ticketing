import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

// // replace NATS Service with mock to remove dependency on NATS
// jest.mock("../../nats-wrapper");

it("has a route handler listinging to /api/tickets POST request", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});

it("check not signed in", async () => {
  const response = await request(app).post("/api/tickets").send({}).expect(401);
});

it("check signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({});
  expect(response.status).not.toEqual(401);
});

it("bad title check", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      price: 10,
    })
    .expect(400);
});

it("bad price provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Good",
      price: -10, // Bad price
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Good",
      // No price
    })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  // Add in check to make sure it was really written

  // Fresh database has zero records (memory database)
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Good",
      price: 10.0, // Good price
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(10.0);
  expect(tickets[0].title).toEqual("Good");
});

it("publishes an event", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Good",
      price: 10.0, // Good price
    })
    .expect(201);
  // Let's see what natsWrapper does in mock mode
  // console.log(natsWrapper);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
it("has a route handler listinging to /api/tickets POST request", async () => {});
