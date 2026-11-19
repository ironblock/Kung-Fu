// c-59. Line 631 (map row): `AnimationGroup.play()` corresponds to `playAnimation(group)`.
// Checked: playAnimation starts a group that was not playing; the next update advances it.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, playAnimation, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, rest } from "./_fx";

test("playAnimation", () => {
    const [, g] = createAnimationGroups(gltf([moveClip("a", 0, 1), moveClip("b", 0, 1)], [rest()]));
    const manager = createAnimationManager();
    addAnimationGroup(manager, g!);
    playAnimation(g!);
    expect(g!.isPlaying).toBe(true);
    updateAnimationManager(manager, 300);
    expect(g!.currentTime).toBeCloseTo(0.3, 6);
});
