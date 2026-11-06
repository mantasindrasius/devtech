export class Registry {
  #entries = new Map();

  constructor(label) {
    this.label = label;
  }

  register(kind, definition) {
    if (this.#entries.has(kind)) throw new Error(`Duplicate ${this.label}: ${kind}`);
    this.#entries.set(kind, definition);
    return this;
  }

  get(kind) {
    const definition = this.#entries.get(kind);
    if (!definition) throw new Error(`Unknown ${this.label}: ${kind}`);
    return definition;
  }
}
