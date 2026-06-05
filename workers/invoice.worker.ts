import { Worker } from "bullmq";
import { redisConnectionOptions } from "@/lib/redis";
import { QUEUE_NAMES } from "@/queues/names";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { shouldFail } from "@/services/failure.service";
import { startWorkerTelemetry } from "@/services/job-events.service";
import { InvalidInvoicePayloadError } from "@/lib/errors";

export const invoiceWorker = new Worker(
  QUEUE_NAMES.invoiceGeneration,
  async (job) => {
    await connectToDatabase();

    const { orderId } = job.data;

    console.log(`[InvoiceWorker] Generating invoice for order ${orderId}`);

    // Check for simulated failure
    const fail = await shouldFail("invalid_invoice_payload");
    if (fail) {
      console.log(`[InvoiceWorker] Simulating invalid invoice payload for order ${orderId}`);
      await Order.findByIdAndUpdate(orderId, {
        invoiceStatus: "failed",
      });
      throw new InvalidInvoicePayloadError();
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await Order.findByIdAndUpdate(orderId, {
      invoiceStatus: "generated",
      $push: {
        timeline: {
          type: "invoice_generated",
          message: "Invoice generated successfully",
          queueName: QUEUE_NAMES.invoiceGeneration,
          jobId: job.id,
          timestamp: new Date(),
        },
      },
    });

    console.log(`[InvoiceWorker] Invoice generated for order ${orderId}`);
    return true;
  },
  {
    connection: redisConnectionOptions,
  },
);

startWorkerTelemetry(invoiceWorker);
