// b-19. Lines 326-327: "A compatibility adapter may therefore close over mutable API state and consult the currently assigned easing function on every interior sample."
// A callback that closes over a variable holding the "currently assigned" curve: swapping the
// variable changes the next sample, and the callback is called on every interior sample.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a closure over mutable state is consulted on each interior sample", () => {
    let current: ((g: number) => number) | null = null;
    let calls = 0;
    const easing = (g: number) => {
        calls++;
        return current ? current(g) : g;
    };
    const manager = createAnimationManager();
    const target = { v: -1 };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", easing, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    updateAnimationManager(manager, 500);
    expect(target.v).toBe(5);
    current = (g) => g * g;
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(2.5);
    current = null;
    updateAnimationManager(manager, 100);
    expect(target.v).toBeCloseTo(6, 5);
    expect(calls).toBe(3);
});
