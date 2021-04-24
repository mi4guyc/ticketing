import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async (done) => {
  //    Create an instance of ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "123",
  });
  //    Save ticket to DB
  await ticket.save();
  //    Fetch the ticket twice
  const inst1Ticket = await Ticket.findById(ticket.id);
  const inst2Ticket = await Ticket.findById(ticket.id);

  //    Make different changes to each ticket
  inst1Ticket!.set({ price: 6 });
  inst2Ticket!.set({ price: 7 });

  //    Save the first ticket (should work)
  const resTick1 = await inst1Ticket!.save();

  // Save 2nd ticket based on same starting version - should error due to conflict
  try {
    const resTick2 = await inst2Ticket!.save();
  } catch (err) {
    // console.log(err);
    return done();
  }

  throw new Error("Should never get here");
});

it("check incrementing number of saved tickets", async () => {
  //    Create an instance of ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "123",
  });
  //    Save ticket to DB
  await ticket.save();

  //    Fetch the ticket
  const instTicket = await Ticket.findById(ticket.id);
  instTicket!.set({ price: 6 });
  const resTick1 = await instTicket!.save();

  const inst2Ticket = await Ticket.findById(ticket.id);
  inst2Ticket!.set({ price: 7 });
  const resTick2 = await inst2Ticket!.save();

  const inst3Ticket = await Ticket.findById(ticket.id);
  // console.log(inst3Ticket);
  expect(inst3Ticket!.version).toEqual(2);
});
