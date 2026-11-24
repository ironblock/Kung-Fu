// Proof for AM7: every field of expected.json, shown by running the library.
// Run as app/checks/AM7.proof.test.ts with expected.json copied to app/checks/AM7.expected.json.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
    AnimationGroupMaskMode,
    addAnimationGroup,
    createAnimationGroupMask,
    createAnimationGroups,
    createAnimationManager,
    createNullEngine,
    enableAnimationBlending,
    playAnimation,
    setAnimationWeight,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { AnimationGroup, EngineContext, GltfAnimationData } from "@babylonjs/lite";

const expected = JSON.parse(readFileSync(fileURLToPath(new URL("./AM7.expected.json", import.meta.url)), "utf8")) as Record<string, number>;

function engineWithQueue(): EngineContext {
    const engine = createNullEngine();
    (engine as unknown as { _device: unknown })._device = { queue: { writeTexture(): void {}, writeBuffer(): void {} } };
    return engine;
}

/** Two root bones, Upper (node 0) and Lower (node 1), both at rest y = 4.
 *  Clip A: Upper y = 2, Lower y = 3. Clip B: Upper y = 6, Lower y = 7.
 *  Identity bind and mesh matrices: element 13 of each bone matrix is that bone's y. */
function makeCharacter(): { a: AnimationGroup; b: AnimationGroup; upperY: () => number; lowerY: () => number } {
    const identity = (n: number) => {
        const m = new Float32Array(16 * n);
        for (let i = 0; i < n; i++) m[i * 16] = m[i * 16 + 5] = m[i * 16 + 10] = m[i * 16 + 15] = 1;
        return m;
    };
    const bones = new Float32Array(32);
    const holdY = (y: number) => ({ input: new Float32Array([0, 2]), output: new Float32Array([0, y, 0, 0, y, 0]), interpolation: 0 });
    const clip = (name: string, upper: number, lower: number) => ({
        name,
        channels: [
            { samplerIdx: 0, nodeIdx: 0, path: 0 },
            { samplerIdx: 1, nodeIdx: 1, path: 0 },
        ],
        samplers: [holdY(upper), holdY(lower)],
        duration: 2,
        frameRate: 60,
    });
    const rest = { parentIdx: -1, tx: 0, ty: 4, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 };
    const data = {
        clips: [clip("A", 2, 3), clip("B", 6, 7)],
        nodes: [{ ...rest }, { ...rest }],
        skeletons: [{ jointNodes: [0, 1], inverseBindMatrices: identity(2), invMeshWorld: identity(1), boneTexture: {}, boneCount: 2, boneMatrices: bones }],
        morphBindings: [],
        nodeTargets: [],
        excludedNodeIndices: new Set<number>(),
        nodeNames: ["Upper", "Lower"],
    } as unknown as GltfAnimationData;
    const [a, b] = createAnimationGroups(data) as [AnimationGroup, AnimationGroup];
    return { a, b, upperY: () => bones[13]!, lowerY: () => bones[16 + 13]! };
}

interface Setup {
    bFirst?: boolean;
    masks?: boolean;
    weightB?: number;
}

function run(setup: Setup): { upper: number; lower: number } {
    const { a, b, upperY, lowerY } = makeCharacter();
    const manager = createAnimationManager({ engine: engineWithQueue() });
    playAnimation(a);
    playAnimation(b);
    for (const group of setup.bFirst ? [b, a] : [a, b]) {
        addAnimationGroup(manager, group);
    }
    if (setup.masks) {
        a.mask = createAnimationGroupMask(["Upper"], AnimationGroupMaskMode.Exclude);
        b.mask = createAnimationGroupMask(["Upper"], AnimationGroupMaskMode.Include);
    }
    setAnimationWeight(a, 1);
    setAnimationWeight(b, setup.weightB ?? 1);
    enableAnimationBlending(manager);
    updateAnimationManager(manager, 16);
    return { upper: upperY(), lower: lowerY() };
}

describe("AM7 proof", () => {
    it("bothFullUpperY: no masks, both at 1, A added first", () => {
        expect(run({}).upper).toBeCloseTo(expected.bothFullUpperY!, 3);
    });

    it("bothFullBAddedFirstUpperY: the same with B added first", () => {
        expect(run({ bFirst: true }).upper).toBeCloseTo(expected.bothFullBAddedFirstUpperY!, 3);
    });

    it("layeredLowerY: complementary masks, both at 1", () => {
        expect(run({ masks: true }).lower).toBeCloseTo(expected.layeredLowerY!, 3);
    });

    it("layeredLowerYWithBAtHalf: complementary masks, A at 1, B at 0.5", () => {
        expect(run({ masks: true, weightB: 0.5 }).lower).toBeCloseTo(expected.layeredLowerYWithBAtHalf!, 3);
    });
});
