export const QUEUE_NAMES = {
  paymentProcessing: "payment_processing",
  inventorySync: "inventory_sync",
  invoiceGeneration: "invoice_generation",
  emailNotifications: "email_notifications",
  shipmentUpdates: "shipment_updates",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
