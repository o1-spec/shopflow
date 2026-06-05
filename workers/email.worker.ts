import { Worker } from "bullmq";
import { redisConnectionOptions } from "@/lib/redis";
import { QUEUE_NAMES } from "@/queues/names";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { shouldFail } from "@/services/failure.service";
import { startWorkerTelemetry } from "@/services/job-events.service";
import { SMTPRateLimitError } from "@/lib/errors";

export const emailWorker = new Worker(
  QUEUE_NAMES.emailNotifications,
  async (job) => {
    await connectToDatabase();

    const { orderId } = job.data;

    console.log(`[EmailWorker] Sending notification email for order ${orderId}`);

    // Check for simulated failure
    const fail = await shouldFail("smtp_rate_limit");
    if (fail) {
      console.log(`[EmailWorker] Simulating SMTP rate limit error for order ${orderId}`);
      await Order.findByIdAndUpdate(orderId, {
        emailStatus: "failed",
      });
      throw new SMTPRateLimitError();
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await Order.findByIdAndUpdate(orderId, {
      emailStatus: "sent",
      $push: {
        timeline: {
          type: "email_sent",
          message: "Order email sent successfully",
          queueName: QUEUE_NAMES.emailNotifications,
          jobId: job.id,
          timestamp: new Date(),
        },
      },
    });

    console.log(`[EmailWorker] Notification email sent for order ${orderId}`);
    return true;
  },
  {
    connection: redisConnectionOptions,
  },
);

startWorkerTelemetry(emailWorker);
