// a-59, lines 211-212: "Fully opt-in: the first call to `createAnimationGroupMask` is what activates the controller's masking path, so animated scenes that never create a mask pay zero bundle bytes."
// internal design, with an effect a user can see: until createAnimationGroupMask has been called once in the program,
// a mask object made by hand is not applied; after that call the same object is. (The bundle-bytes half is not probed.)
// This file must not call createAnimationGroupMask before the first assertion; vitest runs each file in a fresh module graph.
import { createAnimationGroupMask } from "@babylonjs/lite";
import type { AnimationGroupMask } from "@babylonjs/lite";
import { twoNodes } from "./_mask.ts";

test("masking starts with the first createAnimationGroupMask call", () => {
    const handMade = { mode: 0, names: [], disabled: false } as unknown as AnimationGroupMask; // Include, no names: masks everything
    const { group, root, step } = twoNodes();
    group.mask = handMade;
    step(500);
    expect(root.p[0]).toBeCloseTo(5, 5);
    createAnimationGroupMask();
    step(0);
    expect(root.p).toEqual([20, 0, 0]);
});
