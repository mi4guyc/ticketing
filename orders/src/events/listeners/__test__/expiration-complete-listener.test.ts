import { Message } from "node-nats-streaming";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { ExpirationCompleteEvent } from "@mi3guyc/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { Order } from "../../../models/orders";
import { OrderStatus } from "@mi3guyc/common";

const setup = async () => {
  // create an instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, order, msg, data };
};

//
// Tests
//
it("Updates the order status to cancelled", async () => {
  const { listener, ticket, order, msg, data } = await setup();
  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emit an order cancelled event", async () => {
  const { listener, ticket, order, msg, data } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});

it("ack the message", async () => {
  const { listener, ticket, order, msg, data } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
