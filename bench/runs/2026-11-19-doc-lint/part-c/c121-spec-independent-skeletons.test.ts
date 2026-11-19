// c-121. Line 751: "**Independent skeleton clips**: Verify a clip targeting one skeleton does not upload or reset another
// skeleton from the same asset"
// Checked: one asset with skeletons A (joint node 0) and B (joint node 1). B's clip is played first, then A's clip alone.
// A's clip writes A's bone texture only, and B's CPU bone matrices keep the pose B's clip gave them.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, recordingEngine, rest, skeleton } from "./_fx";

test("A's clip leaves B alone", () => {
    const rec = recordingEngine();
    const skelA = skeleton(0, "A");
    const skelB = skeleton(1, "B");
    const [clipA, clipB] = createAnimationGroups(gltf([moveClip("a", 0, 10, 1, 0), moveClip("b", 7, 7, 1, 1)], [rest(), rest()], { skeletons: [skelA, skelB] }));
    const manager = createAnimationManager({ engine: rec.engine });
    stopAnimation(clipA!);
    playAnimation(clipB!);
    addAnimationGroup(manager, clipA!);
    addAnimationGroup(manager, clipB!);
    updateAnimationManager(manager, 100);
    const bPose = Array.from(skelB.boneMatrices);
    expect(bPose[12]).toBeCloseTo(-7, 5);
    stopAnimation(clipB!);
    playAnimation(clipA!);
    rec.calls.length = 0;
    updateAnimationManager(manager, 100);
    expect(rec.calls.map((c) => (c.resource as { name: string }).name)).toEqual(["A"]);
    expect(Array.from(skelB.boneMatrices)).toEqual(bPose);
});
