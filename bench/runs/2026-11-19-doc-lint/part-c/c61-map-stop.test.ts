// c-61. Line 633 (map row): `AnimationGroup.stop()` corresponds to `stopAnimation(group)`.
// Checked: stopAnimation stops the group and returns it to its first frame; updates leave it there.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, stopAnimation, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, rest } from "./_fx";

test("stopAnimation", () => {
    const [g] = createAnimationGroups(gltf([moveClip("a", 0, 1)], [rest()]));
    const manager = createAnimationManager();
    addAnimationGroup(manager, g!);
    updateAnimationManager(manager, 300);
    stopAnimation(g!);
    updateAnimationManager(manager, 300);
    expect(g!.isPlaying).toBe(false);
    expect(g!.currentTime).toBe(0);
});
