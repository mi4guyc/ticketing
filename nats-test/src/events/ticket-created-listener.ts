//Instance to test class
import { Message } from "node-nats-streaming";
import { Listener } from "@mi3guyc/common";
import { TicketCreatedEvent } from "@mi3guyc/common";
import { Subjects } from "@mi3guyc/common";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = "payments-service";

  onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    console.log("event data", data);
    //console.log(data.id);
    msg.ack();
  }
}
