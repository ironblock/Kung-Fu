// c-65. Line 637 (map row): `AnimationGroup.weight` / `setWeightForAllAnimatables()` corresponds to
// "`setAnimationWeight(group, weight)`; call `enableAnimationBlending(manager)` for weighted glTF skeleton clips".
// Checked: setAnimationWeight sets group.weight; with enableAnimationBlending on the manager, a glTF skeleton clip of
// weight 0.5 holding x = 10 uploads x = 5.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, enableAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, recordingEngine, rest, rootPose, skeleton } from "./_fx";

test("setAnimationWeight + enableAnimationBlending", () => {
    const rec = recordingEngine();
    const skel = skeleton(0);
    const [g] = createAnimationGroups(gltf([moveClip("a", 10, 10)], [rest()], { skeletons: [skel] }));
    setAnimationWeight(g!, 0.5);
    expect(g!.weight).toBe(0.5);
    const manager = createAnimationManager({ engine: rec.engine });
    enableAnimationBlending(manager);
    addAnimationGroup(manager, g!);
    updateAnimationManager(manager, 100);
    expect(rootPose(skel.boneMatrices).tx).toBeCloseTo(5, 4);
});
