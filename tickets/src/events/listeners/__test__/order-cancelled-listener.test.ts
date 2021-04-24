import { OrderCancelledListener  } from '../order-cancelled-listener';
import { Ticket } from '../../../models/ticket';
import { OrderCancelledEvent, OrderStatus} from '@mi3guyc/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { natsWrapper } from "../../../nats-wrapper";

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // Create and save a ticket
    const orderId = mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        title: "concert",
        price: 5,
        userId: "123",
         });
    
        //  workaround for limitation on Attr in place already
    ticket.set({orderId: orderId});
    await ticket.save();

    // Create fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    return {listener, data, msg, ticket, orderId}
};

    it('updates ticket, publishes and acks', async ()=> {
    const  {listener, data, msg, ticket, orderId} = await setup();

    await listener.onMessage(data,msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(undefined);
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();

});


