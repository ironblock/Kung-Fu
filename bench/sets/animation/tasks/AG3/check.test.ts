import { describe, expect, it } from "vitest";
import {
    addToScene,
    createAnimationGroups,
    createAnimationManager,
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { AnimationClip, AssetContainer, GltfAnimationData, SceneContext } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";
import { jumpToFrame } from "../src/jump-to-frame";

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

describe("jumpToFrame", () => {
    it("jumps a property clip and keeps it playing from there", () => {
        const manager = createAnimationManager();
        const lamp = { level: 0 };
        // level == frame number, 60 frames per second, 2 s long.
        const clip = createPropertyAnimationClip("glow", [{ path: "level", frameRate: 60, keys: [{ frame: 0, value: 0 }, { frame: 120, value: 120 }] }]);
        const group = createPropertyAnimationGroup(manager, lamp, clip, { loop: true });
        updateAnimationManager(manager, 200);
        expect(lamp.level).toBeCloseTo(12, 3);

        jumpToFrame(group, 30);
        updateAnimationManager(manager, 100);
        expect(lamp.level).toBeCloseTo(36, 3);
        expect(group.currentTime).toBeCloseTo(0.6, 4);
        expect(group.isPlaying).toBe(true);
        updateAnimationManager(manager, 100);
        expect(lamp.level).toBeCloseTo(42, 3);

        jumpToFrame(group, 90);
        updateAnimationManager(manager, 50);
        expect(group.currentTime).toBeCloseTo(1.55, 4);
        expect(lamp.level).toBeCloseTo(93, 3);
    });

    it("counts frames in the clip's own frame rate and keeps its speed", () => {
        const manager = createAnimationManager();
        const fan = { angle: 0 };
        // 30 frames per second; angle == 10 * frame; 2 s long; played at double speed.
        const clip = createPropertyAnimationClip("spin", [{ path: "angle", frameRate: 30, keys: [{ frame: 0, value: 0 }, { frame: 60, value: 600 }] }]);
        const group = createPropertyAnimationGroup(manager, fan, clip, { loop: true, speedRatio: 2 });
        updateAnimationManager(manager, 100);

        jumpToFrame(group, 15); // 0.5 s
        updateAnimationManager(manager, 100); // +0.2 s of clip time
        expect(fan.angle).toBeCloseTo(210, 2);
        expect(group.currentTime).toBeCloseTo(0.7, 4);
        expect(group.isPlaying).toBe(true);
    });

    it("jumps a glTF clip played by the scene and keeps it playing", () => {
        const scene = makeScene();
        // Hips x == 10 * time over 2 s.
        const { groups, targets } = loadModel(scene, ["Hips"], [{ name: "Walk", tracks: [{ node: 0, times: [0, 2], xs: [0, 20] }] }]);
        const walk = groups[0]!;
        tick(scene, 5, 20);

        jumpToFrame(walk, 60); // 1 s at the loader's 60 frames per second
        tick(scene, 5, 20); // +0.1 s
        expect(targets[0]!.position.x).toBeCloseTo(11, 3);
        expect(walk.currentTime).toBeCloseTo(1.1, 4);
        expect(walk.isPlaying).toBe(true);

        jumpToFrame(walk, 6);
        tick(scene, 10, 20); // +0.2 s
        expect(walk.currentTime).toBeCloseTo(0.3, 4);
        expect(targets[0]!.position.x).toBeCloseTo(3, 3);
    });

    it("jumps a property clip that plays once, and it still stops at its end", () => {
        const manager = createAnimationManager();
        const bell = { swing: 0 };
        // swing == frame number, 60 frames per second, 2 s long, played once.
        const clip = createPropertyAnimationClip("ring", [{ path: "swing", frameRate: 60, keys: [{ frame: 0, value: 0 }, { frame: 120, value: 120 }] }]);
        const group = createPropertyAnimationGroup(manager, bell, clip, { loop: false });
        updateAnimationManager(manager, 200);
        expect(bell.swing).toBeCloseTo(12, 3);

        jumpToFrame(group, 90);
        updateAnimationManager(manager, 300); // 1.8 s
        expect(bell.swing).toBeCloseTo(108, 3);
        expect(group.isPlaying).toBe(true);
        updateAnimationManager(manager, 400); // past the end
        expect(bell.swing).toBe(120);
        expect(group.isPlaying).toBe(false);
        updateAnimationManager(manager, 300);
        expect(bell.swing).toBe(120);
        expect(group.isPlaying).toBe(false);
    });

    it("keeps a glTF clip's own speed after the jump", () => {
        const scene = makeScene();
        // Hips x == 10 * time over 2 s; the app plays this clip at 1.5 times its speed.
        const { groups, targets } = loadModel(scene, ["Hips"], [{ name: "Run", tracks: [{ node: 0, times: [0, 2], xs: [0, 20] }] }]);
        const run = groups[0]!;
        run.speedRatio = 1.5;
        tick(scene, 5, 20); // 0.15 s of clip time

        jumpToFrame(run, 30); // 0.5 s
        tick(scene, 4, 25); // +0.15 s of clip time
        expect(run.currentTime).toBeCloseTo(0.65, 4);
        expect(targets[0]!.position.x).toBeCloseTo(6.5, 3);
        expect(run.isPlaying).toBe(true);
    });
});
