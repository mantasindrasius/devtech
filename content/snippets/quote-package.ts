// One cohesive package; few public exports.
//
// order-quotes/
//   src/
//     index.ts             <- supported exports
//     contract.ts          <- request / result
//     create-quotes.ts     <- complete operation
//     internal/
//       validate-request.ts
//       pricing-policy.ts
//   test/
//     quotes.test.ts       <- public behavior
//
// index.ts:
export { createQuotes } from './create-quotes';
export type { QuoteRequest, Quote } from './contract';

// Keep internal files when they clarify the code.
// Do not turn every helper into a package.
