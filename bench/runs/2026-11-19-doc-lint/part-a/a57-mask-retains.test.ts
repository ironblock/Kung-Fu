// a-57, lines 208-210: "When set, only the targets the mask **retains** animate; masked-out targets stay at their bind/rest pose (matching Babylon.js, which pauses those targets)."
// The Babylon.js comparison is not probed. The arm is first moved off its rest pose, then masked out: it should go back to and stay at rest.
import { createAnimationGroupMask } from "@babylonjs/lite";
import { twoNodes } from "./_mask.ts";

test("only retained targets animate; a masked-out target stays at rest", () => {
    const { group, root, arm, step } = twoNodes();
    step(250);
    expect(arm.p[0]).toBeCloseTo(-2.5, 5);
    group.mask = createAnimationGroupMask(["root"]);
    step(250);
    expect(root.p[0]).toBeCloseTo(5, 5);
    expect(arm.p).toEqual([7, 0, 0]);
    step(250);
    expect(root.p[0]).toBeCloseTo(7.5, 5);
    expect(arm.p).toEqual([7, 0, 0]);
});
