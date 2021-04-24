import { Message } from "node-nats-streaming";
import { Listener, OrderCreatedEvent, Subjects } from "@mi3guyc/common/build";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

// import { Ticket } from "../../models/ticket";
// import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { natsWrapper } from "../../nats-wrapper";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log("calculated expire in minutes: ", delay / (1000 * 60));

    // Write to Redis to get a delayed event
    // Using queues/expiration-queue.ts - should return message in about 15 minutes
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay: delay,
      }
    );

    // in collection, find ticket that order is reserving
    // const ticket = await Ticket.findById(data.ticket.id);

    //  throw error if no ticket
    // if (!ticket) {
    //   throw new Error("Ticket not found");
    // }
    //
    // //  Mark ticket reserved by setting orderId
    // ticket.set({ orderId: data.id });
    //
    // // Save Ticket
    // await ticket.save();
    //
    // // Update ticket
    // await new TicketUpdatedPublisher(natsWrapper.client).publish({
    //   id: ticket.id,
    //   version: ticket.version,
    //   title: ticket.title,
    //   price: ticket.price,
    //   userId: ticket.userId,
    //   orderId: ticket.orderId,
    // });

    // Ack message
    msg.ack();
  }
}
