// Check for AM4. The reader never sees this file.
import { describe, expect, it } from "vitest";
import { createAnimationGroups, createNullEngine, createPropertyAnimationClip, playAnimation, setAnimationWeight } from "@babylonjs/lite";
import type { AnimationGroup, EngineContext, GltfAnimationData } from "@babylonjs/lite";
import { createMixer } from "../src/mix-all";

/** The null engine has no GPU device; skinned clips upload bone matrices through one, so give it
 *  a queue that accepts and drops the uploads. The bone matrices stay readable on the CPU. */
function engineWithQueue(): EngineContext {
    const engine = createNullEngine();
    (engine as unknown as { _device: unknown })._device = { queue: { writeTexture(): void {}, writeBuffer(): void {} } };
    return engine;
}

/** One skinned bone, rest position y = 4. Clip "low" holds it at y = 2, clip "high" at y = 6.
 *  Bone matrix = root * local, with identity bind and mesh matrices, so element 13 is the bone's y. */
function makeCharacter(): { groups: AnimationGroup[]; bones: Float32Array } {
    const identity = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    const bones = new Float32Array(16);
    const holdY = (name: string, y: number) => ({
        name,
        channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
        samplers: [{ input: new Float32Array([0, 2]), output: new Float32Array([0, y, 0, 0, y, 0]), interpolation: 0 }],
        duration: 2,
        frameRate: 60,
    });
    const data = {
        clips: [holdY("low", 2), holdY("high", 6)],
        nodes: [{ parentIdx: -1, tx: 0, ty: 4, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 }],
        skeletons: [{ jointNodes: [0], inverseBindMatrices: identity(), invMeshWorld: identity(), boneTexture: {}, boneCount: 1, boneMatrices: bones }],
        morphBindings: [],
        nodeTargets: [],
        excludedNodeIndices: new Set<number>(),
        nodeNames: ["Spine"],
    } as unknown as GltfAnimationData;
    const groups = createAnimationGroups(data);
    for (const group of groups) {
        playAnimation(group);
    }
    return { groups, bones };
}

const holdX = (name: string, x: number) => createPropertyAnimationClip(name, [{ path: "x", keys: [{ time: 0, value: x }, { time: 2, value: x }] }]);

function setUp() {
    const { groups, bones } = makeCharacter();
    const hud = { x: 0 };
    const mixer = createMixer(engineWithQueue(), groups, hud, [holdX("dim", 10), holdX("bright", 30)]);
    return { low: groups[0]!, high: groups[1]!, bones, hud, mixer };
}

describe("AM4 createMixer", () => {
    it("plays the HUD clips on the HUD, looping, in order", () => {
        const { hud, mixer } = setUp();
        expect(mixer.hudGroups.map((group) => group.name)).toEqual(["dim", "bright"]);
        for (const group of mixer.hudGroups) {
            expect(group.isPlaying).toBe(true);
            expect(group.loopAnimation).toBe(true);
            expect(group.targetedAnimations[0]?.target).toBe(hud);
        }
    });

    it("mixes the character and the HUD by weight at the same time", () => {
        const { low, high, bones, hud, mixer } = setUp();
        const [dim, bright] = mixer.hudGroups as [AnimationGroup, AnimationGroup];

        setAnimationWeight(low, 0.5);
        setAnimationWeight(high, 0.5);
        setAnimationWeight(dim, 0.25);
        setAnimationWeight(bright, 0.75);
        mixer.step(16);
        expect(bones[13]).toBeCloseTo(4, 4);
        expect(hud.x).toBeCloseTo(25, 4);

        // Weights that do not add up to 1: the library sums weight times value.
        setAnimationWeight(low, 0.25);
        setAnimationWeight(high, 0.25);
        setAnimationWeight(dim, 0.5);
        setAnimationWeight(bright, 0.25);
        mixer.step(16);
        expect(bones[13]).toBeCloseTo(2, 4);
        expect(hud.x).toBeCloseTo(12.5, 4);
    });

    it("mixes the character alone and the HUD alone", () => {
        const { low, high, bones, hud, mixer } = setUp();
        const [dim, bright] = mixer.hudGroups as [AnimationGroup, AnimationGroup];

        setAnimationWeight(low, 0.75);
        setAnimationWeight(high, 0.25);
        mixer.step(16);
        expect(bones[13]).toBeCloseTo(3, 4);

        setAnimationWeight(low, 1);
        setAnimationWeight(high, 1);
        setAnimationWeight(dim, 0.75);
        setAnimationWeight(bright, 0.25);
        mixer.step(16);
        expect(hud.x).toBeCloseTo(15, 4);
    });

    it("moves every clip on by deltaMs", () => {
        const { low, high, mixer } = setUp();
        setAnimationWeight(low, 0.5);
        setAnimationWeight(high, 0.5);
        mixer.step(250);
        mixer.step(300);
        expect(low.currentTime).toBeCloseTo(0.55, 4);
        expect(high.currentTime).toBeCloseTo(0.55, 4);
        for (const group of mixer.hudGroups) {
            expect(group.currentTime).toBeCloseTo(0.55, 4);
        }
    });
});
