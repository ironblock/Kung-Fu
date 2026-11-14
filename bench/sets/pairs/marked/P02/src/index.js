import { randomUUID } from 'node:crypto';

export const exportsDir = './exports'; // @T04

function newOrderId() {
  return `order-${randomUUID()}`;
}

export function receiptPath(orderId) { // @T04
  return `${exportsDir}/${orderId}.csv`;
}

export { default as checkout, Cart } from './cart.js';
export {
  addItem,
  removeItem,
  total,
} from './cart.js';
export * from './money.js';
export { newOrderId }; // @T03
