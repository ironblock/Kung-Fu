// c-28. Line 584: "Weighted glTF skeleton blending is kept behind the generic `enableAnimationBlending(manager)` opt-in
// so manual-only or direct glTF playback does not load the skeletal mixer."
// Checked, the behaviour: a glTF group of weight 0.5 that holds the root bone at x = 10 uploads x = 10 on a manager
// without the call, and x = 5 on a manager with it. What a bundle loads is not checked.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, enableAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, recordingEngine, rest, rootPose, skeleton } from "./_fx";

function run(enable: boolean): number {
    const rec = recordingEngine();
    const skel = skeleton(0);
    const [group] = createAnimationGroups(gltf([moveClip("hold", 10, 10)], [rest()], { skeletons: [skel] }));
    const manager = createAnimationManager({ engine: rec.engine });
    if (enable) {
        enableAnimationBlending(manager);
    }
    addAnimationGroup(manager, group!);
    setAnimationWeight(group!, 0.5);
    updateAnimationManager(manager, 100);
    return rootPose(skel.boneMatrices).tx;
}

test("weight is applied only after the opt-in", () => {
    expect(run(false)).toBeCloseTo(10, 5);
    expect(run(true)).toBeCloseTo(5, 5);
});
