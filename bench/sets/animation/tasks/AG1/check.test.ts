import { describe, expect, it } from "vitest";
import { addToScene, createAnimationGroups, playAnimation, stopAnimation } from "@babylonjs/lite";
import type { AnimationClip, AnimationGroup, AssetContainer, GltfAnimationData, SceneContext } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";
import { skipToEnd } from "../src/skip-to-end";

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

describe("skipToEnd", () => {
    it("shows the final pose of a looping clip and holds it while frames render", () => {
        const scene = makeScene();
        const { groups, targets } = loadModel(scene, ["Hips", "Head"], [
            { name: "Wave", tracks: [{ node: 0, times: [0, 0.5, 1], xs: [0, 4, 10] }, { node: 1, times: [0, 1], xs: [5, -5] }] },
        ]);
        const wave = groups[0]!;
        expect(wave.isPlaying).toBe(true);
        expect(wave.loopAnimation).toBe(true);
        tick(scene, 7, 20);
        expect(targets[0]!.position.x).toBeGreaterThan(0);

        skipToEnd(wave);
        tick(scene, 1, 20);
        expect(targets[0]!.position.x).toBeCloseTo(10, 4);
        expect(targets[1]!.position.x).toBeCloseTo(-5, 4);
        expect(wave.currentTime).toBeCloseTo(1, 4);
        expect(wave.isPlaying).toBe(false);

        tick(scene, 6, 20);
        expect(targets[0]!.position.x).toBeCloseTo(10, 4);
        expect(targets[1]!.position.x).toBeCloseTo(-5, 4);
        expect(wave.currentTime).toBeCloseTo(1, 4);
        expect(wave.isPlaying).toBe(false);
    });

    it("works on a longer clip that was started by the app, at another speed", () => {
        const scene = makeScene();
        const { groups, targets } = loadModel(scene, ["Root", "Arm"], [
            { name: "Idle", tracks: [{ node: 1, times: [0, 1], xs: [0, 1] }] },
            { name: "Spin", tracks: [{ node: 0, times: [0, 1, 2], xs: [1, 3, 21] }] },
        ]);
        const [idle, spin] = groups as [AnimationGroup, AnimationGroup];
        // The app switched from Idle to Spin.
        stopAnimation(idle);
        spin.speedRatio = 1.5;
        playAnimation(spin);
        tick(scene, 12, 20);
        expect(targets[0]!.position.x).toBeGreaterThan(1);
        expect(targets[0]!.position.x).toBeLessThan(21);

        skipToEnd(spin);
        tick(scene, 3, 20);
        expect(targets[0]!.position.x).toBeCloseTo(21, 4);
        expect(spin.currentTime).toBeCloseTo(2, 4);
        expect(spin.isPlaying).toBe(false);
    });
});
