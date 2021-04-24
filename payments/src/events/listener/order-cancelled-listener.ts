import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@mi3guyc/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/orders"; // Payment model

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  // Receive order cancelled message
  // subject: Subjects.OrderCancelled;
  // data: {
  //     id: string;
  //     version: number;
  //     ticket: {
  //         id: string;
  //     };
  // };

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    // Get the original order
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error("Order not found");
    }
    order.set({ status: OrderStatus.Cancelled });
    await order.save(); // Save to the payments database

    msg.ack(); // Acknowledge message from NATS with order we just translated
  }
}
