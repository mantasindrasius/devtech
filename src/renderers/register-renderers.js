import { showExampleBanner, validateExample } from '../ui/example-banner.js';
import { Registry } from '../core/registry.js';
import { requireText } from '../content/validation.js';
import { createMermaidPanel } from './mermaid.js';
import { createStackedProjectPanel, validateStackedProjectStep } from './stacked-project.js';

export function registerRenderers() {
  return new Registry('resource renderer')
    .register('code', {
      validate(resource) {
        validateExample(resource.example);
        if (!['typescript', 'javascript'].includes(resource.language))
          throw new Error('Code language must be typescript or javascript');
      },
      create(resource, { code, codePanel, editor }) {
        return {
          panel: codePanel,
          show() {
            code.show(resource.id);
            showExampleBanner(codePanel, resource.example);
            codePanel.hidden = false;
            editor.layout();
          },
          hide() {
            codePanel.hidden = true;
          },
          dispose() {},
        };
      },
    })
    .register('mermaid', {
      validate(resource) {
        requireText(resource.title, 'diagram.title');
        requireText(resource.description, 'diagram.description');
        if (resource.caption !== undefined) requireText(resource.caption, 'diagram.caption');
      },
      create: (resource, { theme }) => createMermaidPanel(resource, theme),
    })
    .register('stacked-project', {
      validate(resource) {
        requireText(resource.title, 'stacked-project.title');
        requireText(resource.description, 'stacked-project.description');
        if (!resource.file.endsWith('.svg')) throw new Error('Stacked project resource must be SVG');
      },
      validateStep: validateStackedProjectStep,
      create: createStackedProjectPanel,
    });
}
