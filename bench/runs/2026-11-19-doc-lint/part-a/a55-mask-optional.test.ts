// a-55, line 193: "mask?: AnimationGroupMask; // optional include/exclude target-name filter"
// Optional: a new group has no mask.
import { bothKinds } from "./_groups.ts";

test("a new group has no mask", () => {
    const { gltf, property } = bothKinds();
    expect([gltf.mask, property.mask]).toEqual([undefined, undefined]);
});
