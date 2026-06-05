import { Schema, models, model } from "mongoose";

const WorkerHeartbeatSchema = new Schema(
  {
    workerName: {
      type: String,
      required: true,
      index: true,
    },
    queueName: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["healthy", "slow", "offline"],
      default: "healthy",
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    activeJobs: {
      type: Number,
      default: 0,
    },
    processedToday: {
      type: Number,
      default: 0,
    },
    failedToday: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const WorkerHeartbeat =
  models.WorkerHeartbeat || model("WorkerHeartbeat", WorkerHeartbeatSchema);
