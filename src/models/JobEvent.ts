import { Schema, models, model } from "mongoose";

const JobEventSchema = new Schema(
  {
    queueName: {
      type: String,
      required: true,
      index: true,
    },
    jobId: {
      type: String,
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    event: {
      type: String,
      enum: [
        "created",
        "active",
        "completed",
        "failed",
        "retried",
        "dead_lettered",
        "worker_heartbeat",
      ],
      required: true,
      index: true,
    },
    attemptsMade: {
      type: Number,
      default: 0,
    },
    errorMessage: String,
    durationMs: Number,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export const JobEvent = models.JobEvent || model("JobEvent", JobEventSchema);
