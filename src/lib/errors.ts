export class PaymentTimeoutError extends Error {
  constructor() {
    super("Payment provider timeout");
  }
}

export class SMTPRateLimitError extends Error {
  constructor() {
    super("SMTP rate limit exceeded");
  }
}

export class InventoryUnavailableError extends Error {
  constructor() {
    super("Inventory service unavailable");
  }
}

export class InvalidInvoicePayloadError extends Error {
  constructor() {
    super("Invalid invoice payload");
  }
}
