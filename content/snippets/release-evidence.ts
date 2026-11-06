type ReleaseEvidence = {
  revision: string;
  errorRate: number;
  p95LatencyMs: number;
  duplicateOrders: number;
  confirmationsDelivered: number;
};

// A 200 response can still hide:
// duplicate effects, lost notifications,
// or a semantically incorrect order.
