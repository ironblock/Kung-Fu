import { toCents } from './money.js';

const TAX_RATE = 0.23;

export class Cart { // @T04
  items = [];
}

function addItem(cart, name, price, quantity = 1) {
  cart.items.push({ name, cents: toCents(price), quantity });
  return cart;
}

function removeItem(cart, name) {
  cart.items = cart.items.filter((item) => item.name !== name);
  return cart;
}

function subtotal(cart) {
  return cart.items.reduce((sum, item) => sum + item.cents * item.quantity, 0);
}

function total(cart) {
  return Math.round(subtotal(cart) * (1 + TAX_RATE));
}

export default function checkout(cart) { // @T04
  return { lines: cart.items.length, due: total(cart) };
}

export { // @T03
  addItem,
  removeItem,
  total,
};
export { TAX_RATE as taxRate }; // @T03
