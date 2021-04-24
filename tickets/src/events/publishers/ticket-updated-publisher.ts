import { Publisher, Subjects, TicketUpdatedEvent } from "@mi3guyc/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
