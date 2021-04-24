import { Publisher, Subjects, PaymentCreatedEvent } from "@mi3guyc/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
