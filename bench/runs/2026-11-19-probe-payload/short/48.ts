import { expect, test } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";

test("a glTF clip on nodes 0 and 1, node 1 in excludedNodeIndices, a manager with no engine, two updates", () => {
    const calls: string[] = [];
    const rec = (i: number, k: string) => ({ set: (...v: number[]) => calls.push(`${i} ${k} ${v}`) });
    const node = (i: number) => ({ position: rec(i, "position"), rotationQuaternion: rec(i, "rotationQuaternion"), scaling: rec(i, "scaling") });
    const t = new Float32Array([0, 1]);
    const rest = { parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 };
    const [group] = createAnimationGroups({
        clips: [{
            name: "c", duration: 1,
            samplers: [
                { input: t, output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 },
                { input: t, output: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1]), interpolation: 0 },
                { input: t, output: new Float32Array([1, 1, 1, 3, 3, 3]), interpolation: 0 },
            ],
            channels: [0, 1, 2, 0].map((s, i) => ({ samplerIdx: s, nodeIdx: i < 3 ? 0 : 1, path: s })),
        }],
        nodes: [rest, rest], skeletons: [], morphBindings: [], nodeNames: ["a", "b"],
        nodeTargets: [node(0), node(1)], excludedNodeIndices: new Set([1]),
    } as never);
    const manager = createAnimationManager();
    addAnimationGroup(manager, group!);
    updateAnimationManager(manager, 250);
    updateAnimationManager(manager, 250);
    expect(calls).toEqual([
        "0 position 2.5,0,0", "0 rotationQuaternion 0,0,0,1", "0 scaling 1.5,1.5,1.5",
        "0 position 5,0,0", "0 rotationQuaternion 0,0,0,1", "0 scaling 2,2,2",
    ]);
});
