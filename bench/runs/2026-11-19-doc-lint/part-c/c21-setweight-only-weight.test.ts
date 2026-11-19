// c-21. Line 575: "`setAnimationWeight()` only changes the group weight, so glTF-only scenes do not load the manual
// property mixer."
// Checked, the first half: after the call the group differs from before only in `weight`, and on a manager with no
// mixer enabled nothing about playback changes. The second half (what a bundle loads) is not checked.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

test("only weight changes", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    const before = { ...group } as Record<string, unknown>;
    const managerBefore = { ...manager } as Record<string, unknown>;
    setAnimationWeight(group, 0.25);
    const after = { ...group } as Record<string, unknown>;
    const changed = Object.keys({ ...before, ...after }).filter((k) => before[k] !== after[k]);
    expect(changed).toEqual(["weight"]);
    expect(group.weight).toBe(0.25);
    expect({ ...manager }).toEqual(managerBefore);
    updateAnimationManager(manager, 500);
    expect(target.v).toBe(5);
});
