// c-09. Line 555: "`mixTarget` resolves the current property owner from the root and path so weighted bucket identity
// and writes follow replaced intermediate objects while preserving aliases that resolve to the same owner."
// Internal design; its user-visible effect is checked with the weighted property mixer on.
// 1. Aliases: two roots whose paths reach one shared object are mixed into one weighted sum on it.
// 2. Replacement: after the intermediate object is replaced, the weighted sum is written to the new object.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const constant = (path: string, v: number) => createPropertyAnimationClip("c", [{ path, keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

test("aliases resolving to one owner share one bucket", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const shared = { x: 0 };
    const rootA = { p: shared };
    const rootB = { q: shared };
    setAnimationWeight(createPropertyAnimationGroup(manager, rootA, constant("p.x", 10)), 0.5);
    setAnimationWeight(createPropertyAnimationGroup(manager, rootB, constant("q.x", 20)), 0.5);
    updateAnimationManager(manager, 0);
    expect(shared.x).toBe(15);
});

test("a replaced intermediate object receives the mixed value", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const root = { p: { x: 0 } };
    setAnimationWeight(createPropertyAnimationGroup(manager, root, constant("p.x", 10)), 0.5);
    setAnimationWeight(createPropertyAnimationGroup(manager, root, constant("p.x", 20)), 0.5);
    updateAnimationManager(manager, 0);
    const old = root.p;
    root.p = { x: -1 };
    updateAnimationManager(manager, 0);
    expect(root.p.x).toBe(15);
    expect(old.x).toBe(15);
    old.x = -7;
    updateAnimationManager(manager, 0);
    expect(old.x).toBe(-7);
});
