interface ShallowQuotes {
  setItems(items: Item[]): void;
  getItems(): Item[];
  setCoupon(code: string): void;
  getCoupon(): string;
  setSubtotal(amount: Money): void;
  getSubtotal(): Money;
  setDiscount(amount: Money): void;
  getDiscount(): Money;
  setShipping(amount: Money): void;
  getShipping(): Money;
  validateItems(): void;
  loadPrices(): Promise<void>;
  calculateDiscount(): void;
  calculateShipping(): void;
  formatQuote(): Quote;
  onStateChange(listener: StateListener): Unsubscribe;
  onStepComplete(listener: StepListener): Unsubscribe;
}
// Events expose intermediate state and steps.
