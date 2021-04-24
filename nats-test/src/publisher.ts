import nats from "node-nats-streaming";
console.log("Publisher Started");
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

//console.clear();
const stan = nats.connect("ticketing", "abc", { url: "http://localhost:4222" });

stan.on("connect", async () => {
  console.log("publisher connected to NATS");

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: "123",
      title: "concert",
      price: 30.0,
      userId: "DummyUserId",
    });
  } catch (err) {
    console.error(err);
  }

  // const data = JSON.stringify({
  //   id: "123",
  //   title: "concert",
  //   price: 21.03,
  // });
  //
  // stan.publish("ticket:created", data, () => {
  //   console.log("data published");
  // });
});
