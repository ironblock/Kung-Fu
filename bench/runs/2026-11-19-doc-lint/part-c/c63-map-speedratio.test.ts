// c-63. Line 635 (map row): `AnimationGroup.speedRatio` corresponds to `group.speedRatio`.
// Checked: setting group.speedRatio = 2 on a playing glTF group and on a property group makes a 100 ms update advance
// 0.2 s.
import { addAnimationGroup, createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, rest } from "./_fx";

test("group.speedRatio scales time", () => {
    const manager = createAnimationManager();
    const [g] = createAnimationGroups(gltf([moveClip("a", 0, 1)], [rest()]));
    addAnimationGroup(manager, g!);
    const p = createPropertyAnimationGroup(manager, { v: 0 }, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]));
    g!.speedRatio = 2;
    p.speedRatio = 2;
    updateAnimationManager(manager, 100);
    expect(g!.currentTime).toBeCloseTo(0.2, 6);
    expect(p.currentTime).toBeCloseTo(0.2, 6);
});
