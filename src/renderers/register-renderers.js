import { showExampleBanner, validateExample } from '../ui/example-banner.js';
import { Registry } from '../core/registry.js';
import { requireText } from '../content/validation.js';
import { createMermaidPanel } from './mermaid.js';
import { createStackedProjectPanel, validateStackedProjectStep } from './stacked-project.js';
import { createSpaceshipPanel, validateSpaceshipStep } from './spaceship-project.js';
import { planetEvolutionRenderer } from './planet-evolution.js';
import { svgIllustrationRenderer } from './svg-illustration.js';

import { codeComparisonRenderer } from './code-comparison.js';
import { agentContextRenderer } from './agent-context.js';
import { agentWorkflowRenderer } from './agent-workflow.js';

export function registerRenderers() {
  return new Registry('resource renderer')
    .register('code-comparison', codeComparisonRenderer)
    .register('agent-context', agentContextRenderer)
    .register('agent-workflow', agentWorkflowRenderer)
    .register('svg-illustration', svgIllustrationRenderer)
    .register('planet-evolution', planetEvolutionRenderer)
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
    })
    .register('spaceship-project', {
      validate(resource) {
        requireText(resource.title, 'spaceship-project.title');
        requireText(resource.description, 'spaceship-project.description');
        if (!resource.file.endsWith('.svg')) throw new Error('Spaceship resource must be SVG');
      },
      validateStep: validateSpaceshipStep,
      create: createSpaceshipPanel,
    });
}
