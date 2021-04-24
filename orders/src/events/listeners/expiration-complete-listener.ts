import { Message } from "node-nats-streaming";
import { Order } from "../../models/orders";
import {
  Subjects,
  Listener,
  ExpirationCompleteEvent,
  NotFoundError,
  OrderStatus,
} from "@mi3guyc/common";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

import { QUEUE_GROUP_NAME_ORDERS } from "./queue-group-name";
import { natsWrapper } from "../../nats-wrapper";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName = QUEUE_GROUP_NAME_ORDERS;

  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    const { orderId } = data;

    // Check if Ticket document is there and version - 1
    const order = await Order.findById(orderId).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    // Don't cancel completed orders
    if (order.status === OrderStatus.Complete) {
      await msg.ack();
      return;
    }

    // Not completed order
    order.set({ status: OrderStatus.Cancelled });
    order.markModified("atatus");
    await order.save();

    // Publish order cancelled event
    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
