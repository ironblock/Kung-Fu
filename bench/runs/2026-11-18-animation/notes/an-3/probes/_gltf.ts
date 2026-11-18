// Builds GltfAnimationData by hand: nodes with live targets, no skin, no morph. Not a probe itself.
import type { GltfAnimationData } from "@babylonjs/lite";

export interface NodeTarget {
    p: number[];
    r: number[];
    s: number[];
    writes: number;
    position: { set(x: number, y: number, z: number): void };
    rotationQuaternion: { set(x: number, y: number, z: number, w: number): void };
    scaling: { set(x: number, y: number, z: number): void };
}

export function nodeTarget(): NodeTarget {
    const t: NodeTarget = {
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

const rest = (tx = 0) => ({ parentIdx: -1, tx, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 });

/** Two nodes, "a" and "b", each with a target. Clip i moves node a's x from 0 to 10*(i+1) and node b's x from 0 to -10 over 1 s. */
export function gltfData(clipCount = 2, names: (string | undefined)[] = ["a", "b"]): { data: GltfAnimationData; targets: NodeTarget[] } {
    const targets = [nodeTarget(), nodeTarget()];
    const clips = [];
    for (let i = 0; i < clipCount; i++) {
        clips.push({
            name: i === 1 ? "" : `clip${i}`,
            duration: 1,
            samplers: [
                { input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10 * (i + 1), 0, 0]), interpolation: 0 as const },
                { input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, -10, 0, 0]), interpolation: 0 as const },
            ],
            channels: [
                { samplerIdx: 0, nodeIdx: 0, path: 0 as const },
                { samplerIdx: 1, nodeIdx: 1, path: 0 as const },
            ],
        });
    }
    const data = {
        clips,
        nodes: [rest(5), rest(7)],
        skeletons: [],
        morphBindings: [],
        nodeTargets: targets,
        excludedNodeIndices: new Set<number>(),
        nodeNames: names,
    } as unknown as GltfAnimationData;
    return { data, targets };
}
