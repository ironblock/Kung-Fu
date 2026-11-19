// c-29. Line 584: "Once enabled, groups sharing the same parsed glTF node array are evaluated into one mixed TRS pose
// and each affected skeleton uploads its bone texture once per update."
// Checked: two groups from one asset (one node array), weights 0.5 and 0.5, holding the root bone at x = 10 and x = 20,
// upload x = 15, and the skeleton's bone texture is written once per update.
import { addAnimationGroups, createAnimationGroups, createAnimationManager, enableAnimationBlending, playAnimation, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, recordingEngine, rest, rootPose, skeleton } from "./_fx";

test("one mixed pose, one upload", () => {
    const rec = recordingEngine();
    const skel = skeleton(0);
    const groups = createAnimationGroups(gltf([moveClip("a", 10, 10), moveClip("b", 20, 20)], [rest()], { skeletons: [skel] }));
    const manager = createAnimationManager({ engine: rec.engine });
    enableAnimationBlending(manager);
    addAnimationGroups(manager, groups);
    for (const g of groups) {
        playAnimation(g);
        setAnimationWeight(g, 0.5);
    }
    updateAnimationManager(manager, 100);
    expect(rootPose(skel.boneMatrices).tx).toBeCloseTo(15, 5);
    expect(rec.calls.filter((c) => c.method === "writeTexture").length).toBe(1);
    updateAnimationManager(manager, 100);
    expect(rec.calls.filter((c) => c.method === "writeTexture").length).toBe(2);
});
