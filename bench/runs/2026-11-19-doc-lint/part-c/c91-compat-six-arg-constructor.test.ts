// c-91. Lines 683-684: "Compat keeps the public six-argument `Animatable(target, animations, from, to, loop,
// speedRatio)` constructor."
// Compat package. Checked: `new Animatable(target, animations, from, to, loop, speedRatio)` with six arguments builds a
// working animatable: it writes `from` at once and advances on its own tick (no native state given, so the compat
// evaluator runs it).
import { Animatable, ramp } from "./_compat";

test("six-argument constructor", () => {
    const target = { v: -1 };
    const animatable = new Animatable(target, [ramp()], 2, 10, false, 2);
    expect(target.v).toBe(2);
    expect(animatable.speedRatio).toBe(2);
    animatable._tick(100);
    expect(target.v).toBeCloseTo(4, 5);
});
