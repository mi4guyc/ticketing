import Queue from "bull";
// import { ExpirationCompleteEvent } from "@mi3guyc/common";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher";
import { natsWrapper } from "../nats-wrapper";
// import { OrderCreatedPublisher } from "../../../orders/src/events/publishers/order-created-publisher";

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  // console.log("TODO publish expire completed for orderId", job.data.orderId);

  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
