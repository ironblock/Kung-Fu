import { expect, test } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, createNullEngine, enableAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import type { GltfAnimationData } from "@babylonjs/lite";

// A manager under enableAnimationBlending holding a glTF group at weight 0.5 that moves node "a" x 0..10 over 1 s; t.writes counts writes.
function setup(manager: ReturnType<typeof createAnimationManager>) {
    const t = { x: -1, writes: 0, position: { set: (x: number) => { t.x = x; t.writes++; } }, rotationQuaternion: { set() {} }, scaling: { set() {} } };
    const node = { parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 };
    const clip = { name: "walk", duration: 1, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
        samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 }] };
    const data = { clips: [clip], nodes: [node], skeletons: [], morphBindings: [], nodeTargets: [t], excludedNodeIndices: new Set(), nodeNames: ["a"] };
    const [group] = createAnimationGroups(data as unknown as GltfAnimationData);
    addAnimationGroup(manager, group!);
    enableAnimationBlending(manager);
    setAnimationWeight(group!, 0.5);
    return { t, group: group! };
}

test("a glTF group at weight 0.5 under enableAnimationBlending, on a manager without and with an engine", () => {
    const bare = createAnimationManager();
    setup(bare);
    expect(() => updateAnimationManager(bare, 250)).toThrow(/requires an AnimationManager engine/);
    const manager = createAnimationManager({ engine: createNullEngine() });
    const { t, group } = setup(manager);
    updateAnimationManager(manager, 250);
    expect(group.currentTime).toBe(0.25);
    expect(t.writes).toBe(0);
    expect(t.x).toBe(-1);
});
