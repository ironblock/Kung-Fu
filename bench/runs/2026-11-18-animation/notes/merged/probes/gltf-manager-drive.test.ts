import { addAnimationGroups, createAnimationGroups, createAnimationManager, goToFrame, pauseAnimation, playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";
import { gltfData, recorder } from "./gltf-fixture.ts";

test("attached to a manager, glTF groups write node targets through position.set and scaling.set, without an engine", () => {
    const targets = [recorder(), recorder()];
    const groups = createAnimationGroups(gltfData(targets));
    const manager = createAnimationManager();
    addAnimationGroups(manager, groups);
    updateAnimationManager(manager, 500);
    expect(targets[0]!.p).toEqual([5, 0, 0]);
    expect(targets[1]!.p).toEqual([0, 2.5, 0]);
    expect(groups[0]!.currentTime).toBe(0.5);
    expect(groups[1]!.currentTime).toBe(0);
});

test("a non-looping glTF group clamps at its end but keeps isPlaying true", () => {
    const targets = [recorder(), recorder()];
    const [move] = createAnimationGroups(gltfData(targets));
    const manager = createAnimationManager();
    addAnimationGroups(manager, [move!]);
    move!.loopAnimation = false;
    updateAnimationManager(manager, 5000);
    expect(move!.currentTime).toBe(1);
    expect(move!.isPlaying).toBe(true);
    expect(targets[0]!.p).toEqual([10, 0, 0]);
});

test("a paused glTF group still writes its pose on every update", () => {
    const targets = [recorder(), recorder()];
    const [move] = createAnimationGroups(gltfData(targets));
    const manager = createAnimationManager();
    addAnimationGroups(manager, [move!]);
    updateAnimationManager(manager, 500);
    pauseAnimation(move!);
    const before = targets[0]!.writes;
    targets[0]!.p = [99, 99, 99];
    updateAnimationManager(manager, 500);
    expect(move!.currentTime).toBe(0.5);
    expect(targets[0]!.writes).toBe(before + 1);
    expect(targets[0]!.p).toEqual([5, 0, 0]);
});

test("a stopped glTF group is not ticked and writes nothing until playAnimation", () => {
    const targets = [recorder(), recorder()];
    const [move, scale] = createAnimationGroups(gltfData(targets));
    const manager = createAnimationManager();
    addAnimationGroups(manager, [move!, scale!]);
    updateAnimationManager(manager, 500);
    expect(targets[1]!.s).toEqual([]);
    playAnimation(scale!);
    updateAnimationManager(manager, 1000);
    expect(targets[1]!.s).toEqual([2, 2, 2]);
    stopAnimation(scale!);
    expect(scale!.currentTime).toBe(0);
    expect(targets[1]!.s).toEqual([2, 2, 2]);
});

test("goToFrame on a playing or paused glTF group writes the pose at once and pauses; on a stopped one with no engine it writes nothing", () => {
    const targets = [recorder(), recorder()];
    const [move, scale] = createAnimationGroups(gltfData(targets));
    goToFrame(move!, 30);
    expect(move!.currentTime).toBe(0.5);
    expect(move!.isPlaying).toBe(false);
    expect(targets[0]!.p).toEqual([5, 0, 0]);
    goToFrame(scale!, 60);
    expect(scale!.currentTime).toBe(1);
    expect(targets[1]!.s).toEqual([]);
});

test("goToFrame on a glTF group past its end wraps when it loops and clamps when it does not", () => {
    const targets = [recorder(), recorder()];
    const [move] = createAnimationGroups(gltfData(targets));
    goToFrame(move!, 90);
    expect(move!.currentTime).toBeCloseTo(0.5, 10);
    move!.loopAnimation = false;
    goToFrame(move!, 90);
    expect(move!.currentTime).toBe(1);
});

test("a rotation channel is written through rotationQuaternion.set as (x, y, z, w)", () => {
    const seen: number[][] = [];
    const node = {
        position: { set: () => {} },
        rotationQuaternion: { set: (x: number, y: number, z: number, w: number) => seen.push([x, y, z, w]) },
        scaling: { set: () => {} },
    };
    const data = {
        ...gltfData(),
        clips: [
            {
                name: "turn",
                duration: 1,
                channels: [{ samplerIdx: 0, nodeIdx: 0, path: 1 }],
                samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 1, 0, 1, 0, 0]), interpolation: 0 }],
            },
        ],
        nodeTargets: [node, undefined],
    } as unknown as Parameters<typeof createAnimationGroups>[0];
    const [turn] = createAnimationGroups(data);
    const manager = createAnimationManager();
    addAnimationGroups(manager, [turn!]);
    updateAnimationManager(manager, 500);
    expect(seen.length).toBe(1);
    expect(seen[0]![1]).toBeCloseTo(Math.SQRT1_2, 5);
    expect(seen[0]![3]).toBeCloseTo(Math.SQRT1_2, 5);
});

test("a node listed in excludedNodeIndices is not written", () => {
    const targets = [recorder(), recorder()];
    const data = { ...gltfData(targets), excludedNodeIndices: new Set([1]) } as unknown as Parameters<typeof createAnimationGroups>[0];
    const [move] = createAnimationGroups(data);
    const manager = createAnimationManager();
    addAnimationGroups(manager, [move!]);
    updateAnimationManager(manager, 500);
    expect(targets[0]!.writes).toBe(1);
    expect(targets[1]!.writes).toBe(0);
});
