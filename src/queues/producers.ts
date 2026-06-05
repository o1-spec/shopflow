import { Queue } from "bullmq";
import { redisConnectionOptions } from "@/lib/redis";
import { QUEUE_NAMES } from "@/queues/names";
import { defaultJobOptions } from "@/queues/options";
import { recordJobEvent } from "@/services/job-events.service";

export const paymentProcessingQueue = new Queue(QUEUE_NAMES.paymentProcessing, {
  connection: redisConnectionOptions,
  defaultJobOptions,
});

export const inventorySyncQueue = new Queue(QUEUE_NAMES.inventorySync, {
  connection: redisConnectionOptions,
  defaultJobOptions,
});

export const invoiceGenerationQueue = new Queue(QUEUE_NAMES.invoiceGeneration, {
  connection: redisConnectionOptions,
  defaultJobOptions,
});

export const emailNotificationsQueue = new Queue(
  QUEUE_NAMES.emailNotifications,
  {
    connection: redisConnectionOptions,
    defaultJobOptions,
  },
);

export const shipmentUpdatesQueue = new Queue(QUEUE_NAMES.shipmentUpdates, {
  connection: redisConnectionOptions,
  defaultJobOptions,
});

export async function addPaymentProcessingJob(orderId: string) {
  const job = await paymentProcessingQueue.add("process-payment", {
    orderId,
  });
  await recordJobEvent({
    queueName: QUEUE_NAMES.paymentProcessing,
    jobId: job.id,
    orderId,
    event: "created",
    attemptsMade: 0,
  });
  return job;
}

export async function addInventorySyncJob(orderId: string) {
  const job = await inventorySyncQueue.add("sync-inventory", {
    orderId,
  });
  await recordJobEvent({
    queueName: QUEUE_NAMES.inventorySync,
    jobId: job.id,
    orderId,
    event: "created",
    attemptsMade: 0,
  });
  return job;
}

export async function addInvoiceGenerationJob(orderId: string) {
  const job = await invoiceGenerationQueue.add("generate-invoice", {
    orderId,
  });
  await recordJobEvent({
    queueName: QUEUE_NAMES.invoiceGeneration,
    jobId: job.id,
    orderId,
    event: "created",
    attemptsMade: 0,
  });
  return job;
}

export async function addEmailNotificationJob(orderId: string, type: string) {
  const job = await emailNotificationsQueue.add("send-email", {
    orderId,
    type,
  });
  await recordJobEvent({
    queueName: QUEUE_NAMES.emailNotifications,
    jobId: job.id,
    orderId,
    event: "created",
    attemptsMade: 0,
    metadata: { type },
  });
  return job;
}

export async function addShipmentUpdateJob(orderId: string) {
  const job = await shipmentUpdatesQueue.add("update-shipment", {
    orderId,
  });
  await recordJobEvent({
    queueName: QUEUE_NAMES.shipmentUpdates,
    jobId: job.id,
    orderId,
    event: "created",
    attemptsMade: 0,
  });
  return job;
}
