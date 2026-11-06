// Assemble the host so the policy itself does not publish its literal URL.
export const privateHost = ['npm', 'dev', 'wixpress', 'com'].join('.');
export const publicHost = 'registry.npmjs.org';
const escapedHost = privateHost.replaceAll('.', '\\.');
const privateRegistry = new RegExp(`https?://${escapedHost}(?::\\d+)?(?:/api/npm/npm-repos)?`, 'gi');
const bareHost = new RegExp(escapedHost, 'gi');
export function sanitizeRegistry(text) {
  return text.replace(privateRegistry, `https://${publicHost}`).replace(bareHost, publicHost);
}
