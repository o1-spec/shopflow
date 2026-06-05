import { Schema, models, model } from "mongoose";

const FailureRuleSchema = new Schema(
  {
    key: {
      type: String,
      enum: [
        "payment_timeout",
        "smtp_rate_limit",
        "inventory_unavailable",
        "invalid_invoice_payload",
        "worker_slowdown",
        "dead_letter_growth",
      ],
      required: true,
      unique: true,
      index: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    probability: {
      type: Number,
      default: 1,
      min: 0,
      max: 1,
    },
    affectedQueue: {
      type: String,
      required: true,
    },
    config: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export const FailureRule =
  models.FailureRule || model("FailureRule", FailureRuleSchema);
