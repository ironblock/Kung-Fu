// c-32. Line 586: "weights are not normalized."
// Checked with enableAnimationBlending on translation: weights 0.5 and 0.25 (total 0.75) on x = 10 and x = 20 give
// 10, not 10/0.75; one group of weight 0.5 on x = 10 gives 5, not 10.
import { addAnimationGroup, addAnimationGroups, createAnimationGroups, createAnimationManager, enableAnimationBlending, playAnimation, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, recordingEngine, rest, rootPose, skeleton } from "./_fx";

test("totals are not divided out", () => {
    const rec = recordingEngine();
    const skel = skeleton(0);
    const groups = createAnimationGroups(gltf([moveClip("a", 10, 10), moveClip("b", 20, 20)], [rest()], { skeletons: [skel] }));
    const manager = createAnimationManager({ engine: rec.engine });
    enableAnimationBlending(manager);
    addAnimationGroups(manager, groups);
    playAnimation(groups[1]!);
    setAnimationWeight(groups[0]!, 0.5);
    setAnimationWeight(groups[1]!, 0.25);
    updateAnimationManager(manager, 100);
    expect(rootPose(skel.boneMatrices).tx).toBeCloseTo(10, 4);

    const skel2 = skeleton(0);
    const [one] = createAnimationGroups(gltf([moveClip("a", 10, 10)], [rest()], { skeletons: [skel2] }));
    const m2 = createAnimationManager({ engine: rec.engine });
    enableAnimationBlending(m2);
    addAnimationGroup(m2, one!);
    setAnimationWeight(one!, 0.5);
    updateAnimationManager(m2, 100);
    expect(rootPose(skel2.boneMatrices).tx).toBeCloseTo(5, 4);
});
