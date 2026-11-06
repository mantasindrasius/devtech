const evidence = {
  cpu: 'Where does execution time go?',
  allocations: 'What creates GC pressure?',
  heap: 'What stays reachable, and why?',
  traces: 'Which dependency adds latency?',
  offCpu: 'Where are we waiting?',
};

// Capture -> hypothesize -> change -> repeat.
// Preserve workload and environment details.
// Review cost, latency, memory, and correctness.
