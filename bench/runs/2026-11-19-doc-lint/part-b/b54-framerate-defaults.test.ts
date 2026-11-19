// b-54. Line 417: "glTF groups default to 60fps; property groups inherit the `PropertyAnimationClip.frameRate`"
import { createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";
import { gltf, moveClip, rest } from "./_fx";

test("frameRate: 60 for a glTF clip with none; the clip's own for a property group", () => {
    const [g] = createAnimationGroups(gltf([moveClip("m", 0, 1)], [rest()]));
    expect(g!.frameRate).toBe(60);
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }], { frameRate: 24 });
    expect(clip.frameRate).toBe(24);
    expect(createPropertyAnimationGroup(createAnimationManager(), { v: 0 }, clip).frameRate).toBe(24);
});
