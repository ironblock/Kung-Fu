// b-47. Line 409: "`AnimationGroup.currentTime` stores time in **seconds**"
import { addAnimationGroup, createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, nodeRecorder, rest } from "./_fx";

test("after 250 ms of play, currentTime is 0.25 on a property group and on a glTF group", () => {
    const manager = createAnimationManager();
    const prop = createPropertyAnimationGroup(manager, { v: 0 }, createPropertyAnimationClip("c", [{ path: "v", frameRate: 30, keys: [{ frame: 0, value: 0 }, { frame: 60, value: 1 }] }]));
    const [g] = createAnimationGroups(gltf([moveClip("m", 0, 10, 2)], [rest()], { targets: [nodeRecorder()] }));
    addAnimationGroup(manager, g!);
    updateAnimationManager(manager, 250);
    expect(prop.currentTime).toBe(0.25);
    expect(g!.currentTime).toBe(0.25);
});
