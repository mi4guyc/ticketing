import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent, OrderStatus } from "@mi3guyc/common";
import { Order } from "../../../models/orders";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  //   Build an Order

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: "sdfsdfsdf",
    status: OrderStatus.Created,
    price: 55.55,
  });
  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: order.version + 1,
    ticket: {
      id: "djdjdj",
    },
  };

  // @ts-ignore
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // console.log("setup - order: ", order);
  return { listener, data, msg, order };
};

it("status moved to cancelled", async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  if (!updatedOrder) {
    throw new Error("cannot find order ID");
  }
  // console.log("updated Order: ", updatedOrder.status);
  expect(updatedOrder.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
