import { Publisher, Subjects, TicketCreatedEvent } from "@mi3guyc/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
