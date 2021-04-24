import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent } from "@mi3guyc/common";
import { Ticket } from "../../models/ticket";
import { QUEUE_GROUP_NAME_ORDERS } from "./queue-group-name";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = QUEUE_GROUP_NAME_ORDERS;
  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { title, price, id } = data;
    const ticket = Ticket.build({
      id,
      title,
      price,
    });
    await ticket.save();
    msg.ack();
  }
}
