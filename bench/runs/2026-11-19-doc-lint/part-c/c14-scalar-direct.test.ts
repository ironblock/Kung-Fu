// c-14. Line 564: "scalar paths (`position.x`, `alpha`, `visible`) write directly to the resolved property;"
// Checked: each of the three paths is assigned the sampled number. For `position.x` the owner has a `set` method, and
// it is not called: the component is assigned directly. Note: `visible` receives a number (1 or 0), not a boolean,
// because key values are numbers; the sentence says only that the write is direct, and that holds.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("scalar paths are assigned directly", () => {
    let setCalls = 0;
    const target = { position: { x: 0, y: 0, z: 0, set: () => setCalls++ }, alpha: 0, visible: 1 as number | boolean };
    const clip = createPropertyAnimationClip("c", [
        { path: "position.x", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] },
        { path: "alpha", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] },
        { path: "visible", interpolation: "step", keys: [{ time: 0, value: 1 }, { time: 0.5, value: 0 }, { time: 1, value: 0 }] },
    ]);
    const manager = createAnimationManager();
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 750);
    expect(target.position.x).toBe(7.5);
    expect(target.alpha).toBe(0.75);
    expect(target.visible).toBe(0);
    expect(setCalls).toBe(0);
});
