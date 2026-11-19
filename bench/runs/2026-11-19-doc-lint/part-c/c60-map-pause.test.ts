// c-60. Line 632 (map row): `AnimationGroup.pause()` corresponds to `pauseAnimation(group)`.
// Checked: pauseAnimation stops time advancing and keeps the time reached.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, pauseAnimation, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, rest } from "./_fx";

test("pauseAnimation", () => {
    const [g] = createAnimationGroups(gltf([moveClip("a", 0, 1)], [rest()]));
    const manager = createAnimationManager();
    addAnimationGroup(manager, g!);
    updateAnimationManager(manager, 300);
    pauseAnimation(g!);
    updateAnimationManager(manager, 300);
    expect(g!.isPlaying).toBe(false);
    expect(g!.currentTime).toBeCloseTo(0.3, 6);
});
