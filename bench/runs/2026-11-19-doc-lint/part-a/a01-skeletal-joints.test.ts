// a-01, line 7: "Supports skeletal joint transforms, morph target weights, KHR_animation_pointer channels, and manual tracks bound to object property paths such as `position.x`, `position`, `rotationQuaternion`, or `scaling`."
// This probe takes the first item: skeletal joint transforms.
// A hand-made skeleton of one joint; a clip moves the joint along x. A fake engine records the bone-texture upload.
// The claim holds if the bone matrix the code uploads follows the joint's animated translation.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { data, fakeEngine, lin, rest } from "./_fx.ts";

const identity = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

test("a joint's animated translation reaches the uploaded bone matrix", () => {
    const skeleton = { jointNodes: [0], inverseBindMatrices: identity(), invMeshWorld: identity(), boneTexture: {}, boneCount: 1, boneMatrices: new Float32Array(16) };
    const clip = { name: "walk", duration: 1, samplers: [lin([0, 0, 0], [10, 0, 0])], channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }] };
    const { data: d } = data([clip], { names: ["joint"], nodes: [rest()], targets: [undefined], skeletons: [skeleton] });
    const { engine, textures } = fakeEngine();
    const manager = createAnimationManager({ engine });
    const [group] = createAnimationGroups(d);
    addAnimationGroup(manager, group!);
    updateAnimationManager(manager, 0);
    const atZero = textures.at(-1)!;
    updateAnimationManager(manager, 500);
    const atHalf = textures.at(-1)!;
    expect(textures.length).toBe(2);
    // The translation column of the bone matrix moved by 5 units in total (sign depends on the root handedness transform).
    const moved = Math.hypot(atHalf[12]! - atZero[12]!, atHalf[13]! - atZero[13]!, atHalf[14]! - atZero[14]!);
    expect(moved).toBeCloseTo(5, 5);
});
