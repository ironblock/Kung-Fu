// c-20. Line 575: "Calling `enablePropertyAnimationBlending(manager)` installs a manager-side mixer for manual property
// tracks that share the same target and property path."
// Checked: two weighted groups on one target's property. Without the call the later group's value is what remains;
// with it the property holds the mixed value.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const constant = (v: number) => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

function run(enable: boolean): number {
    const manager = createAnimationManager();
    if (enable) {
        enablePropertyAnimationBlending(manager);
    }
    const target = { v: 0 };
    setAnimationWeight(createPropertyAnimationGroup(manager, target, constant(10)), 0.5);
    setAnimationWeight(createPropertyAnimationGroup(manager, target, constant(20)), 0.5);
    updateAnimationManager(manager, 0);
    return target.v;
}

test("the call turns on mixing for a shared property", () => {
    expect(run(false)).toBe(20);
    expect(run(true)).toBe(15);
});
