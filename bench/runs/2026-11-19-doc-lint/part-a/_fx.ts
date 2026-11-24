// Shared builders for the part-a probes. Not a probe itself.
// Builds GltfAnimationData by hand, as the glTF loader would hand it to createAnimationGroups.
// No GPU: a fake engine records the device calls the animation code makes.
import type { EngineContext, GltfAnimationData } from "@babylonjs/lite";

export interface Recorder {
    p: number[];
    r: number[];
    s: number[];
    writes: number;
    position: { set(x: number, y: number, z: number): void };
    rotationQuaternion: { set(x: number, y: number, z: number, w: number): void };
    scaling: { set(x: number, y: number, z: number): void };
}

export function recorder(): Recorder {
    const t: Recorder = {
        p: [0, 0, 0],
        r: [0, 0, 0, 1],
        s: [1, 1, 1],
        writes: 0,
        position: { set: (x, y, z) => { t.p = [x, y, z]; t.writes++; } },
        rotationQuaternion: { set: (x, y, z, w) => { t.r = [x, y, z, w]; t.writes++; } },
        scaling: { set: (x, y, z) => { t.s = [x, y, z]; t.writes++; } },
    };
    return t;
}

export const rest = (parentIdx = -1, tx = 0) => ({ parentIdx, tx, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 });

export interface Sampler {
    input: Float32Array;
    output: Float32Array;
    interpolation: 0 | 1 | 2;
}
export interface Channel {
    samplerIdx: number;
    nodeIdx: number;
    path: number;
    pointerWriter?: (output: Float32Array, offset: number) => void;
    pointerArity?: number;
}
export interface Clip {
    name: string;
    duration: number;
    frameRate?: number;
    samplers: Sampler[];
    channels: Channel[];
}

/** One glTF data set. Nodes are named by `names`; each node gets a recorder target unless `targets` says otherwise. */
export function data(clips: Clip[], opts: { names?: (string | undefined)[]; nodes?: ReturnType<typeof rest>[]; targets?: (Recorder | undefined)[]; skeletons?: unknown[]; morphBindings?: unknown[] } = {}): { data: GltfAnimationData; targets: (Recorder | undefined)[] } {
    const names = opts.names ?? ["root", "arm"];
    const nodes = opts.nodes ?? names.map(() => rest());
    const targets = opts.targets ?? nodes.map(() => recorder());
    const d = {
        clips,
        nodes,
        skeletons: opts.skeletons ?? [],
        morphBindings: opts.morphBindings ?? [],
        nodeTargets: targets,
        excludedNodeIndices: new Set<number>(),
        nodeNames: names,
    } as unknown as GltfAnimationData;
    return { data: d, targets };
}

/** A LINEAR sampler from `a` at 0 s to `b` at `seconds`. */
export function lin(a: number[], b: number[], seconds = 1, interpolation: 0 | 1 | 2 = 0): Sampler {
    return { input: new Float32Array([0, seconds]), output: new Float32Array([...a, ...b]), interpolation };
}

/** Clip "move": node 0 x 0 -> 10, node 1 x 0 -> -10, over 1 s. */
export function moveClip(name = "move"): Clip {
    return {
        name,
        duration: 1,
        samplers: [lin([0, 0, 0], [10, 0, 0]), lin([0, 0, 0], [-10, 0, 0])],
        channels: [
            { samplerIdx: 0, nodeIdx: 0, path: 0 },
            { samplerIdx: 1, nodeIdx: 1, path: 0 },
        ],
    };
}

/** A fake engine: records writeBuffer and writeTexture calls. */
export function fakeEngine(): { engine: EngineContext; buffers: { offset: number; data: Float32Array }[]; textures: Float32Array[] } {
    const buffers: { offset: number; data: Float32Array }[] = [];
    const textures: Float32Array[] = [];
    const device = {
        queue: {
            writeBuffer: (_b: unknown, offset: number, src: ArrayBuffer, srcOffset = 0, size?: number) => {
                buffers.push({ offset, data: new Float32Array(src.slice(srcOffset, size === undefined ? undefined : srcOffset + size)) });
            },
            writeTexture: (_d: unknown, src: ArrayBuffer) => {
                textures.push(new Float32Array(src.slice(0)));
            },
        },
    };
    return { engine: { _device: device } as unknown as EngineContext, buffers, textures };
}
