// A hand-made GltfAnimationData with no skeleton and no morph target, so no engine is needed.
// Node 0 "root" and node 1 "arm" each have a scene target that records what is written to it.
import type { GltfAnimationData } from "@babylonjs/lite";

export interface Recorder {
    position: { set(x: number, y: number, z: number): void };
    rotationQuaternion: { set(x: number, y: number, z: number, w: number): void };
    scaling: { set(x: number, y: number, z: number): void };
    p: number[];
    s: number[];
    writes: number;
}

export function recorder(): Recorder {
    const r: Recorder = {
        p: [],
        s: [],
        writes: 0,
        position: { set: (x, y, z) => ((r.p = [x, y, z]), r.writes++) },
        rotationQuaternion: { set: () => r.writes++ },
        scaling: { set: (x, y, z) => ((r.s = [x, y, z]), r.writes++) },
    };
    return r;
}

const rest = (parentIdx: number) => ({ parentIdx, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 });

/** Clip "move": node 0 translates x 0 -> 10 over 1 s. Clip "" (unnamed): node 1 scales 1 -> 3 over 2 s. */
export function gltfData(targets: Recorder[] = [recorder(), recorder()], frameRate?: number): GltfAnimationData {
    return {
        clips: [
            {
                name: "move",
                duration: 1,
                frameRate,
                channels: [
                    { samplerIdx: 0, nodeIdx: 0, path: 0 },
                    { samplerIdx: 1, nodeIdx: 1, path: 0 },
                ],
                samplers: [
                    { input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 },
                    { input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 0, 5, 0]), interpolation: 0 },
                ],
            },
            {
                name: "",
                duration: 2,
                channels: [{ samplerIdx: 0, nodeIdx: 1, path: 2 }],
                samplers: [{ input: new Float32Array([0, 2]), output: new Float32Array([1, 1, 1, 3, 3, 3]), interpolation: 0 }],
            },
        ],
        nodes: [rest(-1), rest(0)],
        skeletons: [],
        morphBindings: [],
        nodeTargets: targets,
        excludedNodeIndices: new Set<number>(),
        nodeNames: ["root", "arm"],
    } as unknown as GltfAnimationData;
}
