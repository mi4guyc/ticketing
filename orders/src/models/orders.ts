import mongoose, { Schema } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { OrderStatus } from "@mi3guyc/common";
import { TicketDoc } from "./ticket";

// export enum OrderStatus {
//   // Order created, but ticket has not been reserved
//   Created = "created",
//   // Already reserved by someone else, user cancelled order, payment expires
//   Cancelled = "cancelled",
//   // Order was reserved and waiting payment
//   AwaitingPayment = "awaiting:payment",
//   // Reserved and payment completed
//   Complete = "complete",
// }
//
// import Date = module;

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
      required: false,
    },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
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

// New Version System
orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
