const CENTS = 100;

export const CURRENCY = 'EUR'; // @T04

export let locale = 'en-IE'; // @T04

export function setLocale(next) { // @T04
  locale = next;
}

function toCents(amount) {
  return Math.round(amount * CENTS);
}

function fromCents(cents) {
  return cents / CENTS;
}

function formatPrice(cents) {
  const style = { style: 'currency', currency: CURRENCY };
  return new Intl.NumberFormat(locale, style).format(fromCents(cents));
}

export { toCents, fromCents, formatPrice }; // @T03
