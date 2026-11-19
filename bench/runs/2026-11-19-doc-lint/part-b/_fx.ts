// Shared fixtures for the part-b probes. Not a probe itself.
import type { EngineContext, GltfAnimationData } from "@babylonjs/lite";

/** A scene-node stand-in that records what a glTF group writes to it. */
export interface NodeRecorder {
    p: number[];
    r: number[];
    s: number[];
    writes: number;
    position: { set(x: number, y: number, z: number): void };
    rotationQuaternion: { set(x: number, y: number, z: number, w: number): void };
    scaling: { set(x: number, y: number, z: number): void };
}

export function nodeRecorder(): NodeRecorder {
    const r: NodeRecorder = {
        p: [],
        r: [],
        s: [],
        writes: 0,
        position: { set: (x, y, z) => ((r.p = [x, y, z]), r.writes++) },
        rotationQuaternion: { set: (x, y, z, w) => ((r.r = [x, y, z, w]), r.writes++) },
        scaling: { set: (x, y, z) => ((r.s = [x, y, z]), r.writes++) },
    };
    return r;
}

export interface Rest {
    parentIdx: number;
    tx: number;
    ty: number;
    tz: number;
    rx: number;
    ry: number;
    rz: number;
    rw: number;
    sx: number;
    sy: number;
    sz: number;
}

export function rest(parentIdx = -1, tx = 0): Rest {
    return { parentIdx, tx, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 };
}

export interface ClipSpec {
    name: string;
    duration: number;
    frameRate?: number;
    channels: { samplerIdx: number; nodeIdx: number; path: 0 | 1 | 2 }[];
    samplers: { input: Float32Array; output: Float32Array; interpolation: 0 | 1 | 2 }[];
}

/** Hand-made glTF animation data: no morph targets; skeletons only when given. */
export function gltf(clips: ClipSpec[], nodes: Rest[], options: { targets?: (NodeRecorder | undefined)[]; names?: (string | undefined)[]; skeletons?: unknown[] } = {}): GltfAnimationData {
    return {
        clips,
        nodes,
        skeletons: options.skeletons ?? [],
        morphBindings: [],
        nodeTargets: options.targets ?? nodes.map(() => undefined),
        excludedNodeIndices: new Set<number>(),
        nodeNames: options.names ?? nodes.map((_, i) => `n${i}`),
    } as unknown as GltfAnimationData;
}

/** One-channel LINEAR clip on node 0's translation x, from `from` at 0 s to `to` at `seconds`. */
export function moveClip(name: string, from: number, to: number, seconds = 1, nodeIdx = 0): ClipSpec {
    return {
        name,
        duration: seconds,
        channels: [{ samplerIdx: 0, nodeIdx, path: 0 }],
        samplers: [{ input: new Float32Array([0, seconds]), output: new Float32Array([from, 0, 0, to, 0, 0]), interpolation: 0 }],
    };
}

/**
 * A one-bone skeleton binding on node `joint`, with identity inverse-bind and mesh matrices,
 * and an engine stand-in whose device records each bone-texture write. Lets a probe read the
 * pose that the weighted glTF mixer uploads, with no GPU.
 */
export function boneRig(joint = 0): { skeleton: { jointNodes: number[]; inverseBindMatrices: Float32Array; invMeshWorld: Float32Array; boneTexture: object; boneCount: number; boneMatrices: Float32Array }; engine: EngineContext; uploads: number } {
    const identity = () => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    const rig = {
        skeleton: {
            jointNodes: [joint],
            inverseBindMatrices: identity(),
            invMeshWorld: identity(),
            boneTexture: {},
            boneCount: 1,
            boneMatrices: new Float32Array(16),
        },
        engine: undefined as unknown as EngineContext,
        uploads: 0,
    };
    rig.engine = {
        _device: {
            queue: {
                writeTexture: () => {
                    rig.uploads++;
                },
                writeBuffer: () => {},
            },
        },
    } as unknown as EngineContext;
    return rig;
}

/** A fake requestAnimationFrame clock. `frame(now)` runs the queued callback. Call `restore()` after. */
export function fakeRaf(): { frame(now: number): void; pending(): number; restore(): void } {
    const g = globalThis as Record<string, unknown>;
    const queue: ((now: number) => void)[] = [];
    g.requestAnimationFrame = (cb: (now: number) => void): number => {
        queue.push(cb);
        return queue.length;
    };
    g.cancelAnimationFrame = (): void => {
        queue.length = 0;
    };
    return {
        frame(now: number) {
            const cb = queue.shift();
            if (!cb) {
                throw new Error("no frame queued");
            }
            cb(now);
        },
        pending: () => queue.length,
        restore() {
            delete g.requestAnimationFrame;
            delete g.cancelAnimationFrame;
        },
    };
}
