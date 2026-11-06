type DeliveryRequest = {
  orderId: string;
  idempotencyKey: string;
};

type DeliveryResult = { status: 'sent' } | { status: 'already-sent' };

// Define before implementing:
// Who stores the deduplication key?
// Which failures may be retried?
// What is the timeout and retry budget?
// What survives process termination?
