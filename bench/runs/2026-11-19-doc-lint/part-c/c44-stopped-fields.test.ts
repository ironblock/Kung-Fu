// c-44. Line 616: "**STOPPED**: `group.isPlaying = false`, `group.currentTime = 0`, `group._stopped = true`."
// Checked: a glTF group and a property group (no play range, so their first frame is 0), each played to 0.5 s, then
// stopAnimation: isPlaying false, currentTime 0, _stopped true. (_stopped is marked internal but is a readable field.)
import { addAnimationGroup, createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, stopAnimation, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, rest } from "./_fx";

test("stopAnimation sets the three fields", () => {
    const manager = createAnimationManager();
    const [g] = createAnimationGroups(gltf([moveClip("a", 0, 10)], [rest()]));
    addAnimationGroup(manager, g!);
    const p = createPropertyAnimationGroup(manager, { v: 0 }, createPropertyAnimationClip("p", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]));
    updateAnimationManager(manager, 500);
    for (const group of [g!, p]) {
        stopAnimation(group);
        expect([group.isPlaying, group.currentTime, group._stopped]).toEqual([false, 0, true]);
    }
});
