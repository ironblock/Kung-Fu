// b-72. Lines 521-535: "Additive pose/loop layers on top of an override clip:" and the code under it.
// The snippet does not say where walk, headShake and sadPose come from. Read in its favour: they are
// glTF groups on one skinned rig, attached to a manager with an engine, and all have been started
// (playAnimation), as a reader would have them. Clips over 1 s on bone x: walk 0 -> 10, headShake
// 0 -> 4, sadPose 0 -> 60. After 0.5 s: x = walk(0.5) + 0.6 * (headShake(0.5) - headShake(0))
// + 0.35 * (sadPose(2/60) - sadPose(0)) = 5 + 1.2 + 0.7 = 6.9, with sadPose held at frame 2.
import { addAnimationGroups, createAnimationGroups, createAnimationManager, enableAnimationBlending, pauseAnimation, playAnimation, setAnimationAdditive, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { boneRig, gltf, moveClip, rest } from "./_fx";

test("additive layers add their weighted difference from frame 0 on top of the override clip", () => {
    const rig = boneRig(0);
    const [walk, headShake, sadPose] = createAnimationGroups(gltf([moveClip("walk", 0, 10), moveClip("headShake", 0, 4), moveClip("sad_pose", 0, 60)], [rest()], { skeletons: [rig.skeleton] }));
    const manager = createAnimationManager({ engine: rig.engine });
    addAnimationGroups(manager, [walk!, headShake!, sadPose!]);
    for (const g of [walk!, headShake!, sadPose!]) {
        playAnimation(g);
    }

    setAnimationWeight(walk!, 1);

    setAnimationAdditive(headShake!, { referenceFrame: 0 });
    setAnimationWeight(headShake!, 0.6);

    setAnimationAdditive(sadPose!, { referenceFrame: 0 });
    sadPose!.currentTime = 2 / sadPose!.frameRate!;
    pauseAnimation(sadPose!);
    setAnimationWeight(sadPose!, 0.35);

    enableAnimationBlending(manager);

    updateAnimationManager(manager, 500);
    expect(sadPose!.currentTime).toBeCloseTo(2 / 60, 12);
    expect(Math.abs(rig.skeleton.boneMatrices[12]!)).toBeCloseTo(6.9, 5);
});
