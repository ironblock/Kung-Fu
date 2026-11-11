// Totals for the till.

function sum(values) {
  const total = values.reduce((acc, value) => acc + value, 0);
  return total; // @T06
}

function average(values) {
  if (values.length === 0) {
    return;
  }
  const total = sum(values);
  return total / values.length;
}

function caption(total) {
  const text = `Total: ${total}`
  return text // @T06
}

function bump(total) {
  return total + 1;
}

function quoted() {
  return "total";
}

function wrap(total) {
  return compute(total);
}

class Till {
  constructor() {
    this.total = 0;
  }

  read() {
    return this.total;
  }

  add(amount) {
    this.total += amount;
    return this;
  }

  drain() {
    const taken = this.total;
    this.total = 0;
    return taken; // @T06
  }
}

function head(items) {
  if (items.length > 0) return items[0];
  return null;
}

function pick(items, fallback) {
  const found = items.find((item) => item.ready);
  if (!found) return fallback; // @T06
  return found.value;
}

const double = (total) => total * 2;
const same = (total) => total;
const keep = (total) => {
  return total; // @T06
};

function listed(total) {
  return [total];
}

function boxed(total) {
  return { total };
}

function negate(total) {
  return -total;
}

function ready() {
  return true;
}
