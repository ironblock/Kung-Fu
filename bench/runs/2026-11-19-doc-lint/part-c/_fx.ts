// Shared fixtures for the part-c probes. Not a probe itself.
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

export interface Sampler {
    input: Float32Array;
    output: Float32Array;
    interpolation: 0 | 1 | 2;
}

export interface ClipSpec {
    name: string;
    duration: number;
    frameRate?: number;
    channels: { samplerIdx: number; nodeIdx: number; path: 0 | 1 | 2 | 3 }[];
    samplers: Sampler[];
}

/** Hand-made glTF animation data. */
export function gltf(
    clips: ClipSpec[],
    nodes: Rest[],
    options: { targets?: (NodeRecorder | undefined)[]; names?: (string | undefined)[]; skeletons?: unknown[]; morphBindings?: unknown[] } = {}
): GltfAnimationData {
    return {
        clips,
        nodes,
        skeletons: options.skeletons ?? [],
        morphBindings: options.morphBindings ?? [],
        nodeTargets: options.targets ?? nodes.map(() => undefined),
        excludedNodeIndices: new Set<number>(),
        nodeNames: options.names ?? nodes.map((_, i) => `n${i}`),
    } as unknown as GltfAnimationData;
}

/** One LINEAR translation sampler on x from `from` at 0 s to `to` at `seconds`. */
export function moveSampler(from: number, to: number, seconds = 1): Sampler {
    return { input: new Float32Array([0, seconds]), output: new Float32Array([from, 0, 0, to, 0, 0]), interpolation: 0 };
}

/** One-channel LINEAR clip on node `nodeIdx`'s translation x. */
export function moveClip(name: string, from: number, to: number, seconds = 1, nodeIdx = 0): ClipSpec {
    return { name, duration: seconds, channels: [{ samplerIdx: 0, nodeIdx, path: 0 }], samplers: [moveSampler(from, to, seconds)] };
}

/** A quaternion about z for `deg` degrees, as [x, y, z, w]. */
export function zq(deg: number): number[] {
    const h = (deg * Math.PI) / 360;
    return [0, 0, Math.sin(h), Math.cos(h)];
}

/** A constant rotation clip about z on node `nodeIdx`, held from 0 s to 1 s. */
export function turnClip(name: string, fromDeg: number, toDeg = fromDeg, nodeIdx = 0): ClipSpec {
    return {
        name,
        duration: 1,
        channels: [{ samplerIdx: 0, nodeIdx, path: 1 }],
        samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([...zq(fromDeg), ...zq(toDeg)]), interpolation: 0 }],
    };
}

export interface Skel {
    jointNodes: number[];
    inverseBindMatrices: Float32Array;
    invMeshWorld: Float32Array;
    boneTexture: { name: string };
    boneCount: number;
    boneMatrices: Float32Array;
    runtimeSkeleton?: { _disposed?: boolean; boneTexture?: unknown };
}

const identity = (): Float32Array => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

/** A one-bone skeleton binding on node `joint`, with identity inverse-bind and mesh matrices. */
export function skeleton(joint = 0, name = "tex"): Skel {
    return { jointNodes: [joint], inverseBindMatrices: identity(), invMeshWorld: identity(), boneTexture: { name }, boneCount: 1, boneMatrices: new Float32Array(16) };
}

export interface Recorder {
    engine: EngineContext;
    /** One entry per device.queue call, in order: method name plus the texture or buffer named. */
    calls: { method: string; resource: unknown }[];
    /** Every property read on the device or its queue that is not writeTexture/writeBuffer. */
    otherAccess: string[];
}

/** An engine stand-in whose device records each GPU call. */
export function recordingEngine(): Recorder {
    const rec: Recorder = { engine: undefined as unknown as EngineContext, calls: [], otherAccess: [] };
    const queue = new Proxy(
        {
            writeTexture: (dest: { texture: unknown }) => {
                rec.calls.push({ method: "writeTexture", resource: dest.texture });
            },
            writeBuffer: (buffer: unknown) => {
                rec.calls.push({ method: "writeBuffer", resource: buffer });
            },
        },
        {
            get(target, prop, receiver) {
                if (prop !== "writeTexture" && prop !== "writeBuffer") {
                    rec.otherAccess.push(`queue.${String(prop)}`);
                }
                return Reflect.get(target, prop, receiver);
            },
        }
    );
    const device = new Proxy(
        { queue },
        {
            get(target, prop, receiver) {
                if (prop !== "queue") {
                    rec.otherAccess.push(`device.${String(prop)}`);
                }
                return Reflect.get(target, prop, receiver);
            },
        }
    );
    rec.engine = { _device: device } as unknown as EngineContext;
    return rec;
}

/**
 * Reads the local transform of a root bone back from the uploaded bone matrix. Bone matrix =
 * invMeshWorld * world * IBM with identity IBM and invMeshWorld, and world = ROOT * local, where
 * ROOT is diag(-1, 1, 1, 1) in the default left-handed engine. Returns translation x and the
 * rotation angle about z in degrees (valid for rotations about z only, scale 1).
 */
export function rootPose(m: Float32Array): { tx: number; zDeg: number; sx: number } {
    // Column-major. Undo the x mirror: local row 0 = -world row 0.
    const c0x = -m[0]!;
    const c0y = m[1]!;
    const tx = -m[12]!;
    const sx = Math.hypot(c0x, c0y, m[2]!);
    return { tx, zDeg: (Math.atan2(c0y, c0x) * 180) / Math.PI, sx };
}

/** A morph binding on node `nodeIdx` with `count` targets. */
export function morphBinding(nodeIdx: number, count: number): { nodeIdx: number; targetCount: number; weights: Float32Array; weightsBuffer: { name: string }; runtimeMorphTargets?: { _disposed?: boolean; weightsBuffer?: unknown } } {
    return { nodeIdx, targetCount: count, weights: new Float32Array(count), weightsBuffer: { name: "weights" } };
}
