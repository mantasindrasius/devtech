// An offload skill should return evidence.
type CheckRun = {
  revision: string; // immutable source SHA
  scope: string;
  runId: string;
  status: 'running' | 'passed' | 'failed';
  logsUrl: string;
  artifactsUrl?: string;
};

// Dispatch -> track -> inspect -> fix -> rerun.
// Separate code failures from runner failures.
// Never attach an old green run to new code.
