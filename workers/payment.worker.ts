import { Worker } from "bullmq";
import { redisConnectionOptions } from "@/lib/redis";
import { QUEUE_NAMES } from "@/queues/names";
import { Order } from "@/models/Order";
import { connectToDatabase } from "@/lib/mongodb";
import { shouldFail } from "@/services/failure.service";
import { startWorkerTelemetry } from "@/services/job-events.service";
import { PaymentTimeoutError } from "@/lib/errors";

import {
  addInventorySyncJob,
  addInvoiceGenerationJob,
  addEmailNotificationJob,
  addShipmentUpdateJob,
} from "@/queues/producers";

export const paymentWorker = new Worker(
  QUEUE_NAMES.paymentProcessing,
  async (job) => {
    await connectToDatabase();

    const { orderId } = job.data;

    console.log(`[PaymentWorker] Processing payment for order ${orderId}`);

    // Update order status to processing
    await Order.findByIdAndUpdate(orderId, {
      status: "payment_processing",
      paymentStatus: "processing",
    });

    // Check for simulated failure rule
    const fail = await shouldFail("payment_timeout");
    if (fail) {
      console.log(`[PaymentWorker] Simulating payment timeout for order ${orderId}`);
      await Order.findByIdAndUpdate(orderId, {
        status: "failed",
        paymentStatus: "failed",
      });
      throw new PaymentTimeoutError();
    }

    // Check for simulated worker slowdown
    const slow = await shouldFail("worker_slowdown");
    const delay = slow ? 10000 : 3000;
    if (slow) {
      console.log(`[PaymentWorker] Simulating worker slowdown (delaying ${delay}ms) for order ${orderId}`);
    }

    await new Promise((resolve) => setTimeout(resolve, delay));

    await Order.findByIdAndUpdate(orderId, {
      status: "paid",
      paymentStatus: "paid",
      $push: {
        timeline: {
          type: "payment_completed",
          message: "Payment processed successfully" + (slow ? " (with slowdown delay)" : ""),
          queueName: QUEUE_NAMES.paymentProcessing,
          jobId: job.id,
          timestamp: new Date(),
        },
      },
    });

    await Promise.all([
      addInventorySyncJob(orderId),
      addInvoiceGenerationJob(orderId),
      addEmailNotificationJob(orderId, "order-confirmation"),
      addShipmentUpdateJob(orderId),
    ]);

    console.log(`[PaymentWorker] Payment completed for ${orderId}`);

    return true;
  },
  {
    connection: redisConnectionOptions,
  },
);

startWorkerTelemetry(paymentWorker);
