import { Worker } from "bullmq";
import { redisConnectionOptions } from "@/lib/redis";
import { QUEUE_NAMES } from "@/queues/names";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { shouldFail } from "@/services/failure.service";
import { startWorkerTelemetry } from "@/services/job-events.service";
import { InventoryUnavailableError } from "@/lib/errors";

export const inventoryWorker = new Worker(
  QUEUE_NAMES.inventorySync,
  async (job) => {
    await connectToDatabase();

    const { orderId } = job.data;

    console.log(`[InventoryWorker] Inventory sync started for order ${orderId}`);

    // Update order status to syncing
    await Order.findByIdAndUpdate(orderId, {
      status: "inventory_syncing",
    });

    // Check for simulated failure
    const fail = await shouldFail("inventory_unavailable");
    if (fail) {
      console.log(`[InventoryWorker] Simulating inventory sync failure for order ${orderId}`);
      throw new InventoryUnavailableError();
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const order = await Order.findById(orderId);
    if (order) {
      // Deduct product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    await Order.findByIdAndUpdate(orderId, {
      $push: {
        timeline: {
          type: "inventory_synced",
          message: "Inventory synchronized and stock allocated",
          queueName: QUEUE_NAMES.inventorySync,
          jobId: job.id,
          timestamp: new Date(),
        },
      },
    });

    console.log(`[InventoryWorker] Inventory sync completed for order ${orderId}`);
    return true;
  },
  {
    connection: redisConnectionOptions,
  },
);

startWorkerTelemetry(inventoryWorker);
