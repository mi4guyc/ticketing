import { Message } from "node-nats-streaming";
import { Order } from "../../models/orders";
import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  NotFoundError,
  OrderStatus,
} from "@mi3guyc/common";
import { QUEUE_GROUP_NAME_ORDERS } from "./queue-group-name";
import { natsWrapper } from "../../nats-wrapper";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = QUEUE_GROUP_NAME_ORDERS;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const { orderId } = data;

    // Check if Ticket document is there and version - 1
    const order = await Order.findById(orderId).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    // completed order
    order.set({ status: OrderStatus.Complete });
    order.markModified("status");
    await order.save();

    msg.ack();
  }
}
