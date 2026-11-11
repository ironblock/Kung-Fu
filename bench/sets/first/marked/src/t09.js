// Order checks for the warehouse desk.

function audit(order) {
  if (!order) {
    throw new TypeError("order is required"); // @T09
  }
  for (const line of order.lines) {
    if (line.qty < 0) {
      throw new RangeError("negative quantity"); // @T09
    }
  }
  const check = (line) => {
    if (!line.sku) throw new Error("missing sku"); // @T09
  };
  order.lines.forEach((line) => {
    try {
      check(line);
    } catch (err) {
      throw err; // @T09
    }
  });
  function cap(value) {
    if (value > 100) throw new RangeError("too many"); // @T09
  }
  order.lines.forEach((line) => cap(line.qty));
  return order.lines.length;
}

function auditAll(orders) {
  if (!Array.isArray(orders)) {
    throw new TypeError("orders must be a list");
  }
  return orders.map(audit);
}

function review(order) {
  try {
    return audit(order);
  } catch (err) {
    throw new Error("review failed", { cause: err });
  }
}

if (typeof warehouse === "undefined") {
  throw new Error("warehouse is not set up");
}

class Desk {
  audit(order) {
    if (!order.id) throw new Error("order has no id");
  }
}

const tools = {
  audit(order) {
    throw new Error("not supported: " + order.id);
  },
};

const strict = function audit(order) {
  throw new Error("strict mode: " + order.id);
};

function nightShift(orders) {
  if (orders.length === 0) {
    throw new Error("nothing to do");
  }
  function audit(order) {
    if (order.held) throw new Error("order is held"); // @T09
  }
  orders.forEach(audit);
}
