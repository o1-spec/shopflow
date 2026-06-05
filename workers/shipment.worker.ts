import { Worker } from "bullmq";
import { redisConnectionOptions } from "@/lib/redis";
import { QUEUE_NAMES } from "@/queues/names";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { shouldFail } from "@/services/failure.service";
import { startWorkerTelemetry } from "@/services/job-events.service";

export const shipmentWorker = new Worker(
  QUEUE_NAMES.shipmentUpdates,
  async (job) => {
    await connectToDatabase();

    const { orderId } = job.data;

    console.log(`[ShipmentWorker] Handling shipment for order ${orderId}`);

    // Update order status to ready for fulfillment
    await Order.findByIdAndUpdate(orderId, {
      status: "ready_for_fulfillment",
      shipmentStatus: "processing",
    });

    // Check for simulated failure
    const fail = await shouldFail("dead_letter_growth");
    if (fail) {
      console.log(`[ShipmentWorker] Simulating persistent shipment system connection timeout for order ${orderId}`);
      await Order.findByIdAndUpdate(orderId, {
        shipmentStatus: "failed",
      });
      throw new Error("Persistent shipment gateway timeout error (simulating DLQ growth)");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await Order.findByIdAndUpdate(orderId, {
      shipmentStatus: "shipped",
      status: "shipped",
      $push: {
        timeline: {
          type: "shipment_created",
          message: "Shipment registered and handed off to courier",
          queueName: QUEUE_NAMES.shipmentUpdates,
          jobId: job.id,
          timestamp: new Date(),
        },
      },
    });

    console.log(`[ShipmentWorker] Shipment completed for order ${orderId}`);
    return true;
  },
  {
    connection: redisConnectionOptions,
  },
);

startWorkerTelemetry(shipmentWorker);
