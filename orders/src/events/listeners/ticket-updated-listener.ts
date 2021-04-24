import { Message } from "node-nats-streaming";
import {
  Subjects,
  Listener,
  TicketUpdatedEvent,
  NotFoundError,
} from "@mi3guyc/common";
import { Ticket } from "../../models/ticket";
import { QUEUE_GROUP_NAME_ORDERS } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = QUEUE_GROUP_NAME_ORDERS;
  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { title, price, id } = data;

    // Check if Ticket document is there and version - 1
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new NotFoundError();
    }
    // ticket.price = price;
    // ticket.title = title;
    // Stephen's implementation - not sure why ticket structure cannot be updated in place
    ticket.set({ title, price });
    ticket.markModified("title", "price");
    await ticket.save();
    msg.ack();
  }
}
