import { Schema, models, model } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    quantity: Number,
    price: Number,
  },
  { _id: false },
);

const TimelineEventSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    queueName: String,
    jobId: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      name: String,
      email: String,
      phone: String,
    },
    items: [OrderItemSchema],
    subtotal: Number,
    deliveryFee: Number,
    total: Number,

    status: {
      type: String,
      enum: [
        "pending_payment",
        "payment_processing",
        "paid",
        "inventory_syncing",
        "ready_for_fulfillment",
        "shipped",
        "delivered",
        "failed",
      ],
      default: "pending_payment",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "paid", "failed"],
      default: "pending",
    },
    invoiceStatus: {
      type: String,
      enum: ["pending", "generated", "failed"],
      default: "pending",
    },
    emailStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    shipmentStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "failed"],
      default: "pending",
    },

    timeline: [TimelineEventSchema],
  },
  {
    timestamps: true,
  },
);

export const Order = models.Order || model("Order", OrderSchema);
