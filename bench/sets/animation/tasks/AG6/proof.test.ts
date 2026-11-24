import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createAnimationGroups, createNullEngine, goToFrame, playAnimation, stopAnimation } from "@babylonjs/lite";
import type { AnimationClip, AnimationGroup, GltfAnimationData } from "@babylonjs/lite";

// Run from app/ with this file at app/checks/AG6.proof.test.ts; expected.json is read from tasks/AG6/.
const expected = JSON.parse(readFileSync(resolve(import.meta.dirname, "../../tasks/AG6/expected.json"), "utf8")) as {
    neverPlayedPosed: boolean;
    neverPlayedCurrentTime: number;
    stoppedPosed: boolean;
    withEnginePosed: boolean;
    playThenSeekPosed: boolean;
};

interface Vec { x: number; y: number; z: number; set(x: number, y: number, z: number): void }
function vec(x = 0, y = 0, z = 0): Vec {
    return { x, y, z, set(a, b, c) { this.x = a; this.y = b; this.z = c; } };
}
function quat() {
    return { x: 0, y: 0, z: 0, w: 1, set(this: { x: number; y: number; z: number; w: number }, a: number, b: number, c: number, d: number) { this.x = a; this.y = b; this.z = c; this.w = d; } };
}

/** Clip 0 moves the node's x 0 -> 10 over 1 s; clip 1 moves it 0 -> 40 over 2 s. Frame 30 is 0.5 s. */
const AT_30 = [5, 10];

function model(): { clips: AnimationGroup[]; node: { position: Vec } } {
    const node = { position: vec(), rotationQuaternion: quat(), scaling: vec(1, 1, 1) };
    const clip = (name: string, end: number, value: number): AnimationClip => ({
        name,
        channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
        samplers: [{ input: new Float32Array([0, end]), output: new Float32Array([0, 0, 0, value, 0, 0]), interpolation: 0 }],
        duration: end,
    });
    const data: GltfAnimationData = {
        clips: [clip("first", 1, 10), clip("second", 2, 40)],
        nodes: [{ parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 }],
        skeletons: [],
        morphBindings: [],
        nodeTargets: [node],
        excludedNodeIndices: new Set(),
        nodeNames: ["Node"],
    };
    return { clips: createAnimationGroups(data), node };
}

function posed(node: { position: Vec }, value: number): boolean {
    return Math.abs(node.position.x - value) < 1e-6;
}

describe("AG6 proof: goToFrame on glTF clips that are not playing", () => {
    it("the set-up: clip 0 plays, clip 1 never played, the node starts at 0", () => {
        const { clips, node } = model();
        expect(clips[0]!.isPlaying).toBe(true);
        expect(clips[1]!.isPlaying).toBe(false);
        expect(node.position.x).toBe(0);
    });

    it("neverPlayedPosed and neverPlayedCurrentTime", () => {
        const { clips, node } = model();
        goToFrame(clips[1]!, 30);
        expect(posed(node, AT_30[1]!)).toBe(expected.neverPlayedPosed);
        expect(clips[1]!.currentTime).toBeCloseTo(expected.neverPlayedCurrentTime, 9);
    });

    it("stoppedPosed", () => {
        const { clips, node } = model();
        stopAnimation(clips[0]!);
        goToFrame(clips[0]!, 30);
        expect(posed(node, AT_30[0]!)).toBe(expected.stoppedPosed);
    });

    it("withEnginePosed", () => {
        const { clips, node } = model();
        goToFrame(clips[1]!, 30, createNullEngine());
        expect(posed(node, AT_30[1]!)).toBe(expected.withEnginePosed);
    });

    it("playThenSeekPosed", () => {
        const { clips, node } = model();
        playAnimation(clips[1]!);
        goToFrame(clips[1]!, 30);
        expect(posed(node, AT_30[1]!)).toBe(expected.playThenSeekPosed);
    });
});
