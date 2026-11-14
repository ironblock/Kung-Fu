export const counters = new Map(); // @T09 @T10

export function count(name) {
  let seen = counters.get(name) ?? 0;
  counters.set(name, seen + 1);
}

export function report() {
  let total = 0;
  for (const seen of counters.values()) total += seen;
  const lines = [];
  for (const [name, seen] of counters) {
    let share = Math.round((100 * seen) / total);
    lines.push(`${name}: ${seen} (${share}%)`);
  }
  return lines.join('\n');
}
