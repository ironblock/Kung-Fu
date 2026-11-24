import { describe, expect, it } from "vitest";
import { addToScene, createAnimationGroups } from "@babylonjs/lite";
import type { AnimationClip, AssetContainer, GltfAnimationData, SceneContext } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";
import { freezeForPosing } from "../src/pose-mode";

interface Vec { x: number; y: number; z: number; set(x: number, y: number, z: number): void }
interface Quat { x: number; y: number; z: number; w: number; set(x: number, y: number, z: number, w: number): void }
interface Track { node: number; times: number[]; xs: number[] }

function vec(x = 0, y = 0, z = 0): Vec {
    return { x, y, z, set(a, b, c) { this.x = a; this.y = b; this.z = c; } };
}
function quat(): Quat {
    return { x: 0, y: 0, z: 0, w: 1, set(a, b, c, d) { this.x = a; this.y = b; this.z = c; this.w = d; } };
}

/** A model as the glTF loader hands it over: groups made by the library from clip data, added to the scene. */
function loadModel(scene: SceneContext, names: string[], clips: { name: string; tracks: Track[] }[]) {
    const nodes = names.map(() => ({ parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 }));
    const targets = names.map(() => ({ position: vec(), rotationQuaternion: quat(), scaling: vec(1, 1, 1) }));
    const animClips: AnimationClip[] = clips.map((c) => ({
        name: c.name,
        channels: c.tracks.map((t, i) => ({ samplerIdx: i, nodeIdx: t.node, path: 0 as const })),
        samplers: c.tracks.map((t) => ({ input: new Float32Array(t.times), output: new Float32Array(t.xs.flatMap((x) => [x, 0, 0])), interpolation: 0 as const })),
        duration: Math.max(...c.tracks.map((t) => t.times[t.times.length - 1]!)),
    }));
    const data: GltfAnimationData = { clips: animClips, nodes, skeletons: [], morphBindings: [], nodeTargets: targets, excludedNodeIndices: new Set(), nodeNames: names };
    const groups = createAnimationGroups(data);
    addToScene(scene, { entities: [], animationGroups: groups } as unknown as AssetContainer);
    return { groups, targets };
}

describe("freezeForPosing", () => {
    it("keeps the user's edits while frozen, then plays on from the frozen moment", () => {
        const scene = makeScene();
        // Hips x goes 0 -> 10 and Head x goes 0 -> -10 over 1 s.
        const { groups, targets } = loadModel(scene, ["Hips", "Head"], [
            { name: "Walk", tracks: [{ node: 0, times: [0, 1], xs: [0, 10] }, { node: 1, times: [0, 1], xs: [0, -10] }] },
        ]);
        const walk = groups[0]!;
        const [hips, head] = targets as [(typeof targets)[0], (typeof targets)[0]];
        tick(scene, 10, 20); // 0.2 s
        expect(hips.position.x).toBeCloseTo(2, 4);

        const resume = freezeForPosing(walk);
        expect(typeof resume).toBe("function");
        hips.position.set(50, 1, 2);
        head.position.x = 7;
        tick(scene, 5, 20);
        expect(hips.position.x).toBe(50);
        expect(hips.position.y).toBe(1);
        expect(hips.position.z).toBe(2);
        expect(head.position.x).toBe(7);

        resume();
        tick(scene, 1, 20); // 0.2 s + 0.02 s
        expect(walk.isPlaying).toBe(true);
        expect(walk.currentTime).toBeCloseTo(0.22, 4);
        expect(hips.position.x).toBeCloseTo(2.2, 4);
        expect(head.position.x).toBeCloseTo(-2.2, 4);

        tick(scene, 4, 20); // 0.3 s
        expect(walk.currentTime).toBeCloseTo(0.3, 4);
    });

    it("works a second time on the same clip, at another speed", () => {
        const scene = makeScene();
        const { groups, targets } = loadModel(scene, ["Root", "Tail"], [
            { name: "Swim", tracks: [{ node: 0, times: [0, 2], xs: [0, 20] }, { node: 1, times: [0, 2], xs: [3, 23] }] },
        ]);
        const swim = groups[0]!;
        const [root, tail] = targets as [(typeof targets)[0], (typeof targets)[0]];
        swim.speedRatio = 2;
        tick(scene, 5, 20); // 0.2 s of clip time

        let resume = freezeForPosing(swim);
        root.position.x = -4;
        tick(scene, 3, 20);
        expect(root.position.x).toBe(-4);
        resume();
        tick(scene, 5, 20); // +0.2 s of clip time
        expect(swim.currentTime).toBeCloseTo(0.4, 4);
        expect(root.position.x).toBeCloseTo(4, 4);

        resume = freezeForPosing(swim);
        tail.position.set(-1, -1, -1);
        root.position.set(9, 9, 9);
        tick(scene, 4, 20);
        expect(tail.position.x).toBe(-1);
        expect(root.position.y).toBe(9);
        resume();
        tick(scene, 1, 20); // +0.04 s of clip time
        expect(swim.currentTime).toBeCloseTo(0.44, 4);
        expect(root.position.x).toBeCloseTo(4.4, 4);
        expect(tail.position.x).toBeCloseTo(7.4, 4);
    });

    it("plays on from the exact moment when that moment falls between frames", () => {
        const scene = makeScene();
        // Hips x == 100 * time over 1 s. Frames of 16.7 ms: no moment below lands on a whole frame or millisecond.
        const { groups, targets } = loadModel(scene, ["Hips"], [{ name: "Walk", tracks: [{ node: 0, times: [0, 1], xs: [0, 100] }] }]);
        const walk = groups[0]!;
        const hips = targets[0]!;
        tick(scene, 7, 16.7); // 0.1169 s

        const resume = freezeForPosing(walk);
        hips.position.set(-3, 0, 0);
        tick(scene, 3, 16.7);
        expect(hips.position.x).toBe(-3);

        resume();
        tick(scene, 1, 16.7); // 0.1336 s
        expect(walk.isPlaying).toBe(true);
        expect(walk.currentTime).toBeCloseTo(0.1336, 6);
        expect(hips.position.x).toBeCloseTo(13.36, 3);
    });
});
