import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from "@mi3guyc/common/build";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
