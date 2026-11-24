// c-37. Line 588: "rotations compute `reference^-1 * sample`, multiply that delta onto the base rotation, then slerp from
// base to the delta-applied rotation by the additive weight."
// Checked about one axis (z), so the side the delta is multiplied on does not matter: base holds 90 degrees (weight 1);
// the additive clip turns from 30 to 150 degrees over 1 s with reference frame 0 (30 degrees), so at 0.5 s its sample
// is 90 and its delta 60. Delta applied: 150. Slerp from 90 to 150 by weight 0.5: 120 degrees.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, enableAnimationBlending, playAnimation, setAnimationAdditive, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { gltf, recordingEngine, rest, rootPose, skeleton, turnClip } from "./_fx";

test("slerp(base, base*delta, weight)", () => {
    const rec = recordingEngine();
    const skel = skeleton(0);
    const [base, additive] = createAnimationGroups(gltf([turnClip("base", 90), turnClip("add", 30, 150)], [rest()], { skeletons: [skel] }));
    const manager = createAnimationManager({ engine: rec.engine });
    enableAnimationBlending(manager);
    setAnimationAdditive(additive!, { referenceFrame: 0 });
    setAnimationWeight(additive!, 0.5);
    playAnimation(additive!);
    addAnimationGroup(manager, base!);
    addAnimationGroup(manager, additive!);
    updateAnimationManager(manager, 500);
    expect(rootPose(skel.boneMatrices).zDeg).toBeCloseTo(120, 3);
});
