/** Decorate a renderer without changing its scene or animation lifecycle. */
export function withBulletReveals(renderer) {
  return {
    ...renderer,
    validate(resource) {
      renderer.validate(resource);
      if (resource.bulletCount !== undefined &&
          (!Number.isInteger(resource.bulletCount) || resource.bulletCount < 1))
        throw new Error('bulletCount must be a positive integer');
    },
    validateStep(step, resource) {
      renderer.validateStep?.(step, resource);
      if (resource.bulletCount === undefined) return;
      if (!Number.isInteger(step.bullets) || step.bullets < 0 || step.bullets > resource.bulletCount)
        throw new Error(`Invalid bullet reveal count: ${step.bullets}`);
    },
    create(resource, context) {
      const view = renderer.create(resource, context);
      const bullets = [...view.panel.querySelectorAll('[data-bullet]')];
      return {
        ...view,
        show(step, options) {
          for (const bullet of bullets) {
            const visible = Number(bullet.dataset.bullet) <= (step.bullets ?? 0);
            bullet.classList.toggle('bullet-visible', visible);
            bullet.setAttribute('aria-hidden', String(!visible));
          }
          view.show(step, options);
        },
      };
    },
  };
}
