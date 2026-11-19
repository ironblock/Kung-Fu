// c-04. Line 553: "All groups auto-play by default (matching BJS behavior)."
// Checked: every group createAnimationGroups returns is playing, with no call to playAnimation.
// The comparison with Babylon.js is not checked.
import { createAnimationGroups } from "@babylonjs/lite";
import { gltf, moveClip, rest } from "./_fx";

test("every group starts playing", () => {
    const groups = createAnimationGroups(gltf([moveClip("a", 0, 1), moveClip("b", 0, 1), moveClip("c", 0, 1)], [rest()]));
    expect(groups.map((g) => g.isPlaying)).toEqual([true, true, true]);
});
