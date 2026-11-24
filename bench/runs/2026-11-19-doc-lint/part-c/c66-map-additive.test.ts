// c-66. Line 638 (map row): `AnimationGroup.MakeAnimationAdditive(group, frame)` corresponds to
// `setAnimationAdditive(group, { referenceFrame: frame })`.
// Checked: the reference is taken at `frame` on the group's frame rate: referenceFrame 30 at the default 60 fps gives
// the same pose as referenceTime 0.5 s, and a different pose from referenceFrame 0.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, enableAnimationBlending, setAnimationAdditive, updateAnimationManager } from "@babylonjs/lite";
import type { AnimationAdditiveOptions } from "@babylonjs/lite";
import { gltf, moveClip, recordingEngine, rest, rootPose, skeleton } from "./_fx";

function poseWith(options: AnimationAdditiveOptions): number {
    const rec = recordingEngine();
    const skel = skeleton(0);
    const [g] = createAnimationGroups(gltf([moveClip("a", 0, 10)], [rest()], { skeletons: [skel] }));
    const manager = createAnimationManager({ engine: rec.engine });
    enableAnimationBlending(manager);
    setAnimationAdditive(g!, options);
    addAnimationGroup(manager, g!);
    updateAnimationManager(manager, 800);
    return rootPose(skel.boneMatrices).tx;
}

test("referenceFrame is a frame on the group's rate", () => {
    expect(poseWith({ referenceFrame: 30 })).toBeCloseTo(3, 4);
    expect(poseWith({ referenceTime: 0.5 })).toBeCloseTo(3, 4);
    expect(poseWith({ referenceFrame: 0 })).toBeCloseTo(8, 4);
});
