import { Publisher, Subjects, OrderCancelledEvent } from "@mi3guyc/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
