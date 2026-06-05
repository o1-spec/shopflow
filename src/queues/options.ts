import type { JobsOptions } from "bullmq";

export const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5000,
  },
  removeOnComplete: false,
  removeOnFail: false,
};
