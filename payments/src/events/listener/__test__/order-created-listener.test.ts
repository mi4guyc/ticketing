import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { OrderCreatedEvent, OrderStatus } from "@mi3guyc/common";
import { Order } from "../../../models/orders";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  //   Build an Order
  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: "jdjdjd",
    userId: "sdfsdfsdf",
    status: OrderStatus.Created,
    ticket: {
      id: "djdjdj",
      price: 55.55,
    },
  };

  // @ts-ignore
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("replicates the order info", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  // console.log("data.id: ", data.id);

  const order = await Order.findById(data.id);
  // if (order) {
  //   console.log(order);
  // }

  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
