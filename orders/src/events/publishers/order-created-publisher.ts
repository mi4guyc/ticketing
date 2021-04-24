import { Publisher, Subjects, OrderCreatedEvent } from "@mi3guyc/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
