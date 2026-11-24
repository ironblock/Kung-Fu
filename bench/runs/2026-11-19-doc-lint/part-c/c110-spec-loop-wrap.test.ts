// c-110. Line 740: "**Looping**: Verify time wraps correctly at duration boundary"
// Checked on a 1 s looping glTF group: an update to exactly 1 s gives time 0; a further 0.1 s gives 0.1 s.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, rest } from "./_fx";

test("wraps at the boundary", () => {
    const [g] = createAnimationGroups(gltf([moveClip("a", 0, 10)], [rest()]));
    const manager = createAnimationManager();
    addAnimationGroup(manager, g!);
    updateAnimationManager(manager, 1000);
    expect(g!.currentTime).toBe(0);
    updateAnimationManager(manager, 100);
    expect(g!.currentTime).toBeCloseTo(0.1, 6);
});
