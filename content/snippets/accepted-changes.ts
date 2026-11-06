// Measure the same bounded task.
type ChangeEvidence = {
  acceptanceChecks: 'passed' | 'failed';
  contextTokens: number;
  attempts: number;
  elapsedMinutes: number;
  reviewMinutes: number;
};

// Compare cost per accepted change.
// Do not reward cheap, incorrect attempts.
