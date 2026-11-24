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
import { playAgain } from "../src/play-again";

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

describe("playAgain", () => {
    it("replays a finished property one-shot from its first frame, twice", () => {
        const manager = createAnimationManager();
        const door = { open: 0 };
        const clip = createPropertyAnimationClip("open", [{ path: "open", keys: [{ time: 0, value: 0 }, { time: 1, value: 100 }] }]);
        const group = createPropertyAnimationGroup(manager, door, clip, { loop: false });
        updateAnimationManager(manager, 600);
        updateAnimationManager(manager, 600);
        expect(door.open).toBe(100);
        expect(group.isPlaying).toBe(false);

        playAgain(group);
        updateAnimationManager(manager, 250);
        expect(door.open).toBeCloseTo(25, 3);
        expect(group.currentTime).toBeCloseTo(0.25, 4);
        expect(group.isPlaying).toBe(true);
        updateAnimationManager(manager, 500);
        expect(door.open).toBeCloseTo(75, 3);
        updateAnimationManager(manager, 500);
        expect(door.open).toBe(100);
        expect(group.isPlaying).toBe(false);

        playAgain(group);
        updateAnimationManager(manager, 400);
        expect(door.open).toBeCloseTo(40, 3);
    });

    it("keeps the clip's speed when it replays", () => {
        const manager = createAnimationManager();
        const flag = { height: 0 };
        const clip = createPropertyAnimationClip("raise", [{ path: "height", keys: [{ time: 0, value: 2 }, { time: 2, value: 6 }] }]);
        const group = createPropertyAnimationGroup(manager, flag, clip, { loop: false, speedRatio: 0.5 });
        for (let i = 0; i < 9; i++) {
            updateAnimationManager(manager, 500);
        }
        expect(flag.height).toBe(6);

        playAgain(group);
        updateAnimationManager(manager, 1000); // 0.5 s of clip time
        expect(flag.height).toBeCloseTo(3, 3);
    });

    it("replays a finished glTF one-shot played by the scene", () => {
        const scene = makeScene();
        // Lid x goes 0 -> 10 over 1 s.
        const { groups, targets } = loadModel(scene, ["Lid"], [{ name: "Open", tracks: [{ node: 0, times: [0, 1], xs: [0, 10] }] }]);
        const open = groups[0]!;
        open.loopAnimation = false;
        tick(scene, 30, 50); // 1.5 s, past the end
        expect(targets[0]!.position.x).toBeCloseTo(10, 4);

        playAgain(open);
        tick(scene, 5, 50); // 0.25 s
        expect(targets[0]!.position.x).toBeCloseTo(2.5, 3);
        expect(open.currentTime).toBeCloseTo(0.25, 4);
        tick(scene, 20, 50); // past the end again
        expect(targets[0]!.position.x).toBeCloseTo(10, 4);

        playAgain(open);
        tick(scene, 2, 50);
        expect(targets[0]!.position.x).toBeCloseTo(1, 3);
    });

    it("replays a property one-shot that plays only part of its keys", () => {
        const manager = createAnimationManager();
        const gate = { lift: 0 };
        // lift == frame number over keys 0 to 120 at 60 frames per second; the clip plays frames 30 to 90 once.
        const clip = createPropertyAnimationClip("lift", [{ path: "lift", frameRate: 60, keys: [{ frame: 0, value: 0 }, { frame: 120, value: 120 }] }]);
        const group = createPropertyAnimationGroup(manager, gate, clip, { loop: false, fromFrame: 30, toFrame: 90 });
        for (let i = 0; i < 12; i++) {
            updateAnimationManager(manager, 100); // past its end, 1 s after its start
        }
        expect(gate.lift).toBeCloseTo(90, 3);
        expect(group.isPlaying).toBe(false);

        for (let press = 1; press <= 2; press++) {
            playAgain(group);
            updateAnimationManager(manager, 100);
            updateAnimationManager(manager, 100);
            expect(group.isPlaying).toBe(true);
            expect(gate.lift).toBeGreaterThan(30);
            expect(gate.lift).toBeLessThan(90);
            for (let i = 0; i < 10; i++) {
                updateAnimationManager(manager, 100);
            }
            expect(gate.lift).toBeCloseTo(90, 3);
            expect(group.isPlaying).toBe(false);
        }
    });

    it("keeps a glTF one-shot's own speed when it replays", () => {
        const scene = makeScene();
        // Lid x goes 0 -> 10 over 1 s; the app plays this clip at 1.5 times its speed.
        const { groups, targets } = loadModel(scene, ["Lid"], [{ name: "Open", tracks: [{ node: 0, times: [0, 1], xs: [0, 10] }] }]);
        const open = groups[0]!;
        open.loopAnimation = false;
        open.speedRatio = 1.5;
        tick(scene, 20, 50); // 1.5 s of clip time, past the end
        expect(targets[0]!.position.x).toBeCloseTo(10, 4);

        playAgain(open);
        tick(scene, 4, 50); // 0.3 s of clip time
        expect(open.currentTime).toBeCloseTo(0.3, 4);
        expect(targets[0]!.position.x).toBeCloseTo(3, 3);
    });
});
