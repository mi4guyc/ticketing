import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order } from "./orders";
import { OrderStatus } from "@mi3guyc/common";
//
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
  // userId: string;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
  // userId: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // userId: {
    //   type: String,
    //   required: true,
    // },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// Control the version number
ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

// Check if the previous document is in place?
ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    // Not as in course - this = ticket?
    ticket: this.id,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.Complete,
        OrderStatus.AwaitingPayment,
      ],
    },
  });
  return !!existingOrder;
};
const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
