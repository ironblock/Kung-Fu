import { expect, test } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, pauseAnimation, updateAnimationManager } from "@babylonjs/lite";
import type { GltfAnimationData } from "@babylonjs/lite";

// GltfAnimationData with one clip moving node "a" along x from 0 to 10 over 1 s; t.x is the last x written.
function gltf() {
    const t = { x: -1, position: { set: (x: number) => { t.x = x; } }, rotationQuaternion: { set() {} }, scaling: { set() {} } };
    const node = { parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 };
    const clip = { name: "walk", duration: 1, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
        samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 }] };
    const data = { clips: [clip], nodes: [node], skeletons: [], morphBindings: [], nodeTargets: [t], excludedNodeIndices: new Set(), nodeNames: ["a"] };
    const manager = createAnimationManager();
    const [group] = createAnimationGroups(data as unknown as GltfAnimationData);
    addAnimationGroup(manager, group!);
    return { t, group: group!, manager };
}

test("a paused glTF group, and a glTF group with loopAnimation false run past its end", () => {
    const a = gltf();
    updateAnimationManager(a.manager, 250);
    pauseAnimation(a.group);
    a.t.x = 99;
    updateAnimationManager(a.manager, 250);
    expect(a.group.currentTime).toBe(0.25);
    expect(a.t.x).toBe(2.5);
    const b = gltf();
    b.group.loopAnimation = false;
    updateAnimationManager(b.manager, 1500);
    expect(b.group.currentTime).toBe(1);
    expect(b.group.isPlaying).toBe(true);
    expect(b.t.x).toBe(10);
});
