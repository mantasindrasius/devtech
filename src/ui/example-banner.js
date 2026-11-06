import { requireObject, requireText } from '../content/validation.js';

const labels = { bad: 'BAD', better: 'BETTER', good: 'GOOD' };

export function validateExample(example) {
  if (example === undefined) return;
  requireObject(example, 'resource.example');
  if (!Object.hasOwn(labels, example.kind)) throw new Error('Unknown example kind');
  requireText(example.summary, 'resource.example.summary');
}

export function showExampleBanner(panel, example) {
  const banner = panel.querySelector('.example-banner');
  banner.hidden = !example;
  if (!example) {
    delete panel.dataset.example;
    return;
  }
  panel.dataset.example = example.kind;
  banner.querySelector('strong').textContent = labels[example.kind];
  banner.querySelector('span').textContent = example.summary;
}
