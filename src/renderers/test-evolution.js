export const testScenes = ['base', 'fast', 'deterministic', 'assertive', 'readable'];

export function testVersionPair(scene) {
  const index = testScenes.indexOf(scene);
  if (index < 0) throw new Error(`Unknown test attribute: ${scene}`);
  const diff = ['fast', 'deterministic', 'assertive'].includes(scene);
  return { original: diff ? testScenes[index - 1] : scene, modified: scene };
}
