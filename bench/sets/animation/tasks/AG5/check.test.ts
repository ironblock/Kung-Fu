import { describe, expect, it } from "vitest";
import { AnimationGroupMaskMode, addToScene, createAnimationGroups } from "@babylonjs/lite";
import type { AnimationClip, AnimationGroupMask, AssetContainer, GltfAnimationData, SceneContext } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";
import { restoreMask } from "../src/restore-mask";

// This check never makes a mask through the library itself: the saved masks are plain objects, as read from JSON.

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

/** Hips x goes 0 -> 10, Spine x 0 -> 20, Head x 0 -> 30, over 1 s; the rest pose has x = 0. */
function loadBody(scene: SceneContext) {
    const { groups, targets } = loadModel(scene, ["Hips", "Spine", "Head"], [
        {
            name: "Wave",
            tracks: [
                { node: 0, times: [0, 1], xs: [0, 10] },
                { node: 1, times: [0, 1], xs: [0, 20] },
                { node: 2, times: [0, 1], xs: [0, 30] },
            ],
        },
    ]);
    return { wave: groups[0]!, xs: () => targets.map((t) => t.position.x) };
}

function readSaved(json: string): AnimationGroupMask {
    return JSON.parse(json) as AnimationGroupMask;
}

describe("restoreMask", () => {
    it("restores an include mask", () => {
        const scene = makeScene();
        const { wave, xs } = loadBody(scene);
        restoreMask(wave, readSaved(`{"mode":${AnimationGroupMaskMode.Include},"names":["Head"],"disabled":false}`));
        tick(scene, 10, 20); // 0.2 s
        const [hips, spine, head] = xs();
        expect(head).toBeCloseTo(6, 4);
        expect(hips).toBe(0);
        expect(spine).toBe(0);
    });

    it("restores an exclude mask", () => {
        const scene = makeScene();
        const { wave, xs } = loadBody(scene);
        restoreMask(wave, readSaved(`{"mode":${AnimationGroupMaskMode.Exclude},"names":["Spine"],"disabled":false}`));
        tick(scene, 5, 20); // 0.1 s
        const [hips, spine, head] = xs();
        expect(hips).toBeCloseTo(1, 4);
        expect(spine).toBe(0);
        expect(head).toBeCloseTo(3, 4);
    });

    it("restores a disabled mask: every node moves", () => {
        const scene = makeScene();
        const { wave, xs } = loadBody(scene);
        restoreMask(wave, readSaved(`{"mode":${AnimationGroupMaskMode.Include},"names":["Hips"],"disabled":true}`));
        tick(scene, 15, 20); // 0.3 s
        const [hips, spine, head] = xs();
        expect(hips).toBeCloseTo(3, 4);
        expect(spine).toBeCloseTo(6, 4);
        expect(head).toBeCloseTo(9, 4);
    });

    it("restores another mask on the same clip later", () => {
        const scene = makeScene();
        const { wave, xs } = loadBody(scene);
        restoreMask(wave, readSaved(`{"mode":${AnimationGroupMaskMode.Include},"names":["Head"],"disabled":false}`));
        tick(scene, 5, 20); // 0.1 s
        expect(xs()).toEqual([0, 0, expect.closeTo(3, 4)]);

        restoreMask(wave, readSaved(`{"mode":${AnimationGroupMaskMode.Include},"names":["Hips","Spine"],"disabled":false}`));
        tick(scene, 5, 20); // 0.2 s
        const [hips, spine, head] = xs();
        expect(hips).toBeCloseTo(2, 4);
        expect(spine).toBeCloseTo(4, 4);
        expect(head).toBe(0);
    });
});
