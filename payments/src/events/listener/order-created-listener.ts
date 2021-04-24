import { Listener, OrderCreatedEvent, Subjects } from "@mi3guyc/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/orders"; // Payment model

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  // Receive order message, translate into payment order format and save
  // to the payment database.
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    await order.save(); // Save to the payments database
    msg.ack(); // Acknowledge message from NATS with order we just translated
  }
}
