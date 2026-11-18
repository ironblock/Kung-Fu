// Proof for AM6: every field of expected.json, shown by running the library.
// Run as app/checks/AM6.proof.test.ts with expected.json copied to app/checks/AM6.expected.json.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
    addAnimationGroup,
    createAnimationGroups,
    createAnimationManager,
    createNullEngine,
    enableAnimationBlending,
    playAnimation,
    setAnimationWeight,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { AnimationGroup, EngineContext, GltfAnimationData } from "@babylonjs/lite";

const expected = JSON.parse(readFileSync(fileURLToPath(new URL("./AM6.expected.json", import.meta.url)), "utf8")) as Record<string, number>;

/** The null engine with a queue that accepts and drops bone uploads. */
function engineWithQueue(): EngineContext {
    const engine = createNullEngine();
    (engine as unknown as { _device: unknown })._device = { queue: { writeTexture(): void {}, writeBuffer(): void {} } };
    return engine;
}

/** One bone, Spine, rest y = 4. Clip A: y = 2 and a 90 degree turn about Y. Clip B: y = 6.
 *  Identity bind and mesh matrices, so the bone matrix is root * local. */
function makeCharacter(): { a: AnimationGroup; b: AnimationGroup; bones: Float32Array } {
    const identity = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    const bones = new Float32Array(16);
    const s = Math.SQRT1_2;
    const key = (values: number[]) => ({ input: new Float32Array([0, 2]), output: new Float32Array([...values, ...values]), interpolation: 0 });
    const clipA = {
        name: "A",
        channels: [
            { samplerIdx: 0, nodeIdx: 0, path: 0 },
            { samplerIdx: 1, nodeIdx: 0, path: 1 },
        ],
        samplers: [key([0, 2, 0]), key([0, s, 0, s])],
        duration: 2,
        frameRate: 60,
    };
    const clipB = { name: "B", channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }], samplers: [key([0, 6, 0])], duration: 2, frameRate: 60 };
    const data = {
        clips: [clipA, clipB],
        nodes: [{ parentIdx: -1, tx: 0, ty: 4, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 }],
        skeletons: [{ jointNodes: [0], inverseBindMatrices: identity(), invMeshWorld: identity(), boneTexture: {}, boneCount: 1, boneMatrices: bones }],
        morphBindings: [],
        nodeTargets: [],
        excludedNodeIndices: new Set<number>(),
        nodeNames: ["Spine"],
    } as unknown as GltfAnimationData;
    const [a, b] = createAnimationGroups(data) as [AnimationGroup, AnimationGroup];
    return { a, b, bones };
}

/** Plays the given clips at the given weights on a blending manager for one update. */
function run(weights: { a?: number; b?: number }): { y: number; turnDegrees: number } {
    const { a, b, bones } = makeCharacter();
    const manager = createAnimationManager({ engine: engineWithQueue() });
    for (const [group, weight] of [[a, weights.a], [b, weights.b]] as const) {
        if (weight !== undefined) {
            playAnimation(group);
            addAnimationGroup(manager, group);
            setAnimationWeight(group, weight);
        }
    }
    enableAnimationBlending(manager);
    updateAnimationManager(manager, 16);
    // Rows 1 and 2 are untouched by the glTF root's X mirror: y is element 13, and the turn about Y
    // is atan2(-m[2], m[10]).
    return { y: bones[13]!, turnDegrees: (Math.atan2(-bones[2]!, bones[10]!) * 180) / Math.PI };
}

describe("AM6 proof", () => {
    it("aloneHalfY and aloneHalfTurnDegrees: only A, at weight 0.5", () => {
        const result = run({ a: 0.5 });
        expect(result.y).toBeCloseTo(expected.aloneHalfY!, 3);
        expect(result.turnDegrees).toBeCloseTo(expected.aloneHalfTurnDegrees!, 2);
    });

    it("bothHalfY: A and B, at 0.5 each", () => {
        expect(run({ a: 0.5, b: 0.5 }).y).toBeCloseTo(expected.bothHalfY!, 3);
    });

    it("bothThreeQuartersY: A and B, at 0.75 each", () => {
        expect(run({ a: 0.75, b: 0.75 }).y).toBeCloseTo(expected.bothThreeQuartersY!, 3);
    });

    it("control: A alone at full weight shows A's pose", () => {
        const result = run({ a: 1 });
        expect(result.y).toBeCloseTo(2, 3);
        expect(result.turnDegrees).toBeCloseTo(90, 2);
    });
});
