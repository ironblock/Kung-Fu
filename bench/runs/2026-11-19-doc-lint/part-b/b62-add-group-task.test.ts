// b-62. Line 433: "Animation groups are registered through `animation-group-task.ts`: `addAnimationGroup()` stores group ownership outside the generic manager, then adds an internal task that calls `tickAnimation(group, deltaMs, manager.engine)`."
// Internal design; the user-visible parts are checked: after addAnimationGroup the group is listed by
// getAnimationGroups, one task is added to manager.animations, and that task ticks the group with the
// manager's engine (a skinned glTF group, which needs an engine to tick, ticks and uploads; with a
// manager that has no engine it throws). A second manager cannot take an owned group.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, getAnimationGroups, updateAnimationManager } from "@babylonjs/lite";
import { boneRig, gltf, moveClip, rest } from "./_fx";

test("addAnimationGroup lists the group, adds one task, and that task ticks with manager.engine", () => {
    const rig = boneRig(0);
    const [g] = createAnimationGroups(gltf([moveClip("m", 0, 10)], [rest()], { skeletons: [rig.skeleton] }));
    const manager = createAnimationManager({ engine: rig.engine });
    addAnimationGroup(manager, g!);
    expect(getAnimationGroups(manager)).toEqual([g]);
    expect(manager.animations.length).toBe(1);
    updateAnimationManager(manager, 250);
    expect(g!.currentTime).toBe(0.25);
    expect(rig.uploads).toBe(1);
    expect(() => addAnimationGroup(createAnimationManager(), g!)).toThrow(/already attached/);

    const bare = createAnimationGroups(gltf([moveClip("m", 0, 10)], [rest()], { skeletons: [boneRig(0).skeleton] }))[0]!;
    const noEngine = createAnimationManager();
    addAnimationGroup(noEngine, bare);
    expect(() => updateAnimationManager(noEngine, 250)).toThrow(/requires an EngineContext/);
});
