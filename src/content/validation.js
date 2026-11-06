export function requireText(value, path) {
  if (typeof value !== 'string' || !value.trim())
    throw new Error(`${path} must be a non-empty string`);
}

export function requireObject(value, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error(`${path} must be an object`);
}

export function uniqueIds(items, path) {
  if (!Array.isArray(items) || !items.length) throw new Error(`${path} must be a non-empty list`);
  const ids = new Set();
  for (const item of items) {
    requireObject(item, path);
    requireText(item.id, `${path}.id`);
    if (!/^[a-z][a-z0-9-]*$/.test(item.id)) throw new Error(`Invalid ${path} id: ${item.id}`);
    if (ids.has(item.id)) throw new Error(`Duplicate ${path} id: ${item.id}`);
    ids.add(item.id);
  }
}

export function readResource(file, assets) {
  requireText(file, 'resource.file');
  if (/^(?:[/.]|[a-z]+:)/i.test(file) || file.includes('\\') || file.split('/').includes('..')) {
    throw new Error(`Resource path must be relative to content/: ${file}`);
  }
  if (!Object.hasOwn(assets, file)) throw new Error(`Missing resource file: ${file}`);
  return assets[file];
}
