export enum OrderStatus {
  // Order created, but ticket has not been reserved
  Created = "created",
  // Already reserved by someone else, user cancelled order, payment expires
  Cancelled = "cancelled",
  // Order was reserved and waiting payment
  AwaitingPayment = "awaiting:payment",
  // Reserved and payment completed
  Complete = "complete",
}
