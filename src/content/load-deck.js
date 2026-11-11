import { parseDocument } from 'yaml';
import { readResource, requireObject, requireText, uniqueIds } from './validation.js';

export function loadDeck(source, { assets, actions, renderers }) {
  const document = parseDocument(source, { uniqueKeys: true });
  if (document.errors.length) throw new Error(`Invalid deck YAML: ${document.errors[0].message}`);
  const deck = document.toJS({ maxAliasCount: 50 });
  requireObject(deck, 'deck');
  if (deck.version !== 1) throw new Error('Unsupported deck version; expected 1');
  requireText(deck.id, 'deck.id');
  requireText(deck.title, 'deck.title');
  requireObject(deck.presenter, 'presenter');
  for (const field of ['name', 'role', 'company', 'initials'])
    requireText(deck.presenter[field], `presenter.${field}`);
  requireObject(deck.resources, 'resources');
  const resources = loadResources(deck.resources, assets, renderers);
  uniqueIds(deck.slides, 'slides');
  const slides = deck.slides.map((slide) => validateSlide(slide, resources, actions, renderers));
  return { ...deck, resources, slides };
}

function loadResources(definitions, assets, renderers) {
  return Object.fromEntries(
    Object.entries(definitions).map(([id, resource]) => {
      requireObject(resource, `resource ${id}`);
      const renderer = renderers.get(resource.type);
      renderer.validate(resource);
      return [id, { ...resource, id, source: readResource(resource.file, assets) }];
    }),
  );
}

function validateSlide(slide, resources, actions, renderers) {
  if (slide.layout !== undefined && !['standard', 'visual', 'chapter'].includes(slide.layout))
    throw new Error(`${slide.id}.layout must be standard, visual or chapter`);
  for (const field of ['name', 'label', 'description', 'takeaway'])
    requireText(slide[field], `${slide.id}.${field}`);
  if (!Array.isArray(slide.title) || !slide.title.length)
    throw new Error(`${slide.id}.title must contain lines`);
  for (const line of slide.title) {
    requireObject(line, `${slide.id}.title line`);
    requireText(line.text || line.accent, `${slide.id}.title line`);
    for (const field of ['text', 'accent'])
      if (line[field] !== undefined) requireText(line[field], `title.${field}`);
  }
  if (resources[slide.code]?.type !== 'code')
    throw new Error(`${slide.id}: unknown code resource ${slide.code}`);
  if (slide.notes !== undefined && typeof slide.notes !== 'string')
    throw new Error(`${slide.id}.notes must be text`);
  if (slide.principles !== undefined) {
    if (!Array.isArray(slide.principles)) throw new Error(`${slide.id}.principles must be a list`);
    slide.principles.forEach((value) => requireText(value, 'principle'));
  }
  for (const field of ['author', 'runnable', 'hidden']) {
    if (slide[field] !== undefined && typeof slide[field] !== 'boolean')
      throw new Error(`${slide.id}.${field} must be boolean`);
  }
  uniqueIds(slide.steps, `${slide.id}.steps`);
  slide.steps.forEach((step) => validateStep(step, slide, resources, actions, renderers));
  return slide;
}

function validateStep(step, slide, resources, actions, renderers) {
  requireText(step.label, `${slide.id}.${step.id}.label`);
  if (step.description !== undefined)
    requireText(step.description, `${slide.id}.${step.id}.description`);
  if (step.panel !== undefined && !resources[step.panel])
    throw new Error(`Unknown panel resource: ${step.panel}`);
  if (step.panel !== undefined) renderers.get(resources[step.panel].type).validateStep?.(step);
  if (
    step.reveal !== undefined &&
    (!Array.isArray(step.reveal) ||
      step.reveal.some((key) => !['description', 'author', 'principles', 'takeaway'].includes(key)))
  ) {
    throw new Error(`Invalid reveal target in ${slide.id}.${step.id}`);
  }
  if (step.actions !== undefined && !Array.isArray(step.actions))
    throw new Error('Step actions must be a list');
  for (const action of step.actions ?? []) {
    requireObject(action, 'action');
    actions.get(action.type).validate(action, slide);
  }
}
