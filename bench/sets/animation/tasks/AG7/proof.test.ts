import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
    addAnimationGroup,
    addToScene,
    createAnimationGroups,
    createAnimationManager,
    createNullEngine,
    createSceneContext,
    onBeforeRender,
    playAnimation,
    removeAnimationGroup,
    stepScene,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { AnimationClip, AnimationGroup, AssetContainer, EngineContext, GltfAnimationData, SceneContext } from "@babylonjs/lite";

// Run from app/ with this file at app/checks/AG7.proof.test.ts; expected.json is read from tasks/AG7/.
const expected = JSON.parse(readFileSync(resolve(import.meta.dirname, "../../tasks/AG7/expected.json"), "utf8")) as {
    sceneAdvancesAttached: boolean;
    timeWithManagerUpdated: number;
    sceneAdvancesSibling: boolean;
    sceneAdvancesAfterRemove: boolean;
};

function vec() {
    return { x: 0, y: 0, z: 0, set(this: { x: number; y: number; z: number }, a: number, b: number, c: number) { this.x = a; this.y = b; this.z = c; } };
}
function quat() {
    return { x: 0, y: 0, z: 0, w: 1, set(this: { x: number; y: number; z: number; w: number }, a: number, b: number, c: number, d: number) { this.x = a; this.y = b; this.z = c; this.w = d; } };
}

/** A model with two looping 4 s clips on two nodes, added to a scene on the null engine. Both clips play. */
function setUp(): { engine: EngineContext; scene: SceneContext; clip: AnimationGroup; sibling: AnimationGroup } {
    const engine = createNullEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    const clip = (name: string, node: number): AnimationClip => ({
        name,
        channels: [{ samplerIdx: 0, nodeIdx: node, path: 0 }],
        samplers: [{ input: new Float32Array([0, 4]), output: new Float32Array([0, 0, 0, 4, 0, 0]), interpolation: 0 }],
        duration: 4,
    });
    const rest = { parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 };
    const data: GltfAnimationData = {
        clips: [clip("a", 0), clip("b", 1)],
        nodes: [{ ...rest }, { ...rest }],
        skeletons: [],
        morphBindings: [],
        nodeTargets: [0, 1].map(() => ({ position: vec(), rotationQuaternion: quat(), scaling: vec() })),
        excludedNodeIndices: new Set(),
        nodeNames: ["A", "B"],
    };
    const groups = createAnimationGroups(data);
    playAnimation(groups[1]!);
    addToScene(scene, { entities: [], animationGroups: groups } as unknown as AssetContainer);
    const [first, second] = groups as [AnimationGroup, AnimationGroup];
    expect(first.loopAnimation && first.isPlaying && second.isPlaying).toBe(true);
    expect(first.currentTime).toBe(0);
    return { engine, scene, clip: first, sibling: second };
}

describe("AG7 proof: the scene and an AnimationManager", () => {
    it("without a manager the scene advances the clip (the set-up works)", () => {
        const { engine, scene, clip } = setUp();
        stepScene(engine, scene, 250);
        expect(clip.currentTime).toBeCloseTo(0.25, 9);
    });

    it("sceneAdvancesAttached and sceneAdvancesSibling", () => {
        const { engine, scene, clip, sibling } = setUp();
        const manager = createAnimationManager();
        addAnimationGroup(manager, clip);
        stepScene(engine, scene, 250);
        expect(clip.currentTime !== 0).toBe(expected.sceneAdvancesAttached);
        expect(sibling.currentTime !== 0).toBe(expected.sceneAdvancesSibling);
    });

    it("timeWithManagerUpdated", () => {
        const { engine, scene, clip } = setUp();
        const manager = createAnimationManager();
        addAnimationGroup(manager, clip);
        onBeforeRender(scene, () => updateAnimationManager(manager, 250));
        stepScene(engine, scene, 250);
        expect(clip.currentTime).toBeCloseTo(expected.timeWithManagerUpdated, 9);
    });

    it("sceneAdvancesAfterRemove", () => {
        const { engine, scene, clip } = setUp();
        const manager = createAnimationManager();
        addAnimationGroup(manager, clip);
        stepScene(engine, scene, 250);
        removeAnimationGroup(manager, clip);
        const before = clip.currentTime;
        stepScene(engine, scene, 250);
        expect(clip.currentTime !== before).toBe(expected.sceneAdvancesAfterRemove);
    });
});
