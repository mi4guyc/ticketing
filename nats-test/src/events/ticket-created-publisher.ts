import { Publisher, TicketCreatedEvent, Subjects } from "@mi3guyc/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
