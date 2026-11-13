import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { withBulletReveals } from '../src/renderers/bullet-reveals.js';

function aBulletPresentation() {
  const bullets = [1, 1, 2, 3].map((number) => ({
    dataset: { bullet: String(number) },
    classList: { toggle(_, visible) { this.visible = visible; } },
    setAttribute(_, value) { this.hidden = value; },
  }));
  const scenes = [];
  const view = withBulletReveals({
    create: () => ({
      panel: { querySelectorAll: () => bullets },
      show: (step) => scenes.push(step.scene),
    }),
  }).create({});
  return {
    reveal: (count) => view.show({ bullets: count, scene: 'front' }),
    visible: () => bullets.map((bullet) => bullet.classList.visible),
    hidden: () => bullets.map((bullet) => bullet.hidden),
    scenes: () => scenes,
  };
}

test('reveals a point together with its marker and leaves later points hidden', () => {
  const presentation = aBulletPresentation();

  presentation.reveal(0);
  expect(presentation.visible()).toEqual([false, false, false, false]);
  presentation.reveal(1);

  expect(presentation.visible()).toEqual([true, true, false, false]);
  expect(presentation.hidden()).toEqual(['false', 'false', 'true', 'true']);
  expect(presentation.scenes()).toEqual(['front', 'front']);
});

test('hides later points when stepping back and resets all points on replay', () => {
  const presentation = aBulletPresentation();
  presentation.reveal(3);

  presentation.reveal(2);
  expect(presentation.visible()).toEqual([true, true, true, false]);
  presentation.reveal(0);

  expect(presentation.visible()).toEqual([false, false, false, false]);
});

const deck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());
const lists = Object.entries(deck.resources).filter(([, resource]) => resource.bulletCount);

test.each(lists)('%s starts empty and reveals every point one click at a time', async (id, resource) => {
  const source = await Bun.file(new URL(`../content/${resource.file}`, import.meta.url)).text();
  const numbers = [...new Set([...source.matchAll(/data-bullet="(\d+)"/g)].map((match) => Number(match[1])))].sort((a, b) => a - b);
  const steps = deck.slides.flatMap((slide) => slide.steps).filter((step) => step.panel === id);

  expect(numbers).toEqual(Array.from({ length: resource.bulletCount }, (_, index) => index + 1));
  expect(steps[0].bullets).toBe(0);
  expect(steps.at(-1).bullets).toBe(resource.bulletCount);
  for (let index = 1; index < steps.length; index++) {
    expect([0, 1]).toContain(steps[index].bullets - steps[index - 1].bullets);
  }
});
