// b-48. Line 410: "`goToFrame(frame)` converts frame number to seconds with the group's `frameRate`, immediately evaluates the pose through an explicit one-shot evaluator when available, then pauses"
// Property groups have the one-shot evaluator; glTF groups do not, and are evaluated by a zero tick.
// Checked on both: currentTime = frame / frameRate, the pose is written at once, the group is paused
// and later manager updates do not move it.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, nodeRecorder, rest } from "./_fx";

test("goToFrame converts with frameRate, writes the pose, and pauses", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const prop = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 2, value: 20 }] }], { frameRate: 10 }));
    goToFrame(prop, 5);
    expect(prop.currentTime).toBe(0.5);
    expect(target.v).toBe(5);
    expect(prop.isPlaying).toBe(false);
    updateAnimationManager(manager, 500);
    expect(prop.currentTime).toBe(0.5);
    expect(target.v).toBe(5);

    const node = nodeRecorder();
    const [g] = createAnimationGroups(gltf([{ ...moveClip("m", 0, 10, 1), frameRate: 30 }], [rest()], { targets: [node] }));
    addAnimationGroup(manager, g!);
    goToFrame(g!, 15);
    expect(g!.currentTime).toBe(0.5);
    expect(node.p).toEqual([5, 0, 0]);
    expect(g!.isPlaying).toBe(false);
    updateAnimationManager(manager, 250);
    expect(g!.currentTime).toBe(0.5);
    expect(node.p).toEqual([5, 0, 0]);
});
