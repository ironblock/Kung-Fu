// c-62. Line 634 (map row): `AnimationGroup.goToFrame(f)` corresponds to `goToFrame(group, f)` "(uses
// `group.frameRate`)".
// Checked: a property group whose clip is at 30 fps has frameRate 30, and goToFrame(group, 15) lands at 0.5 s; a glTF
// group whose clip says 24 fps lands at 12/24 s for frame 12.
import { createAnimationGroups, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";
import { gltf, moveClip, rest } from "./_fx";

test("goToFrame divides by group.frameRate", () => {
    const g = createPropertyAnimationGroup(createAnimationManager(), { v: 0 }, createPropertyAnimationClip("c", [{ path: "v", frameRate: 30, keys: [{ frame: 0, value: 0 }, { frame: 60, value: 1 }] }]));
    expect(g.frameRate).toBe(30);
    goToFrame(g, 15);
    expect(g.currentTime).toBe(0.5);
    const clip = { ...moveClip("a", 0, 1), frameRate: 24 };
    const [h] = createAnimationGroups(gltf([clip], [rest()]));
    expect(h!.frameRate).toBe(24);
    goToFrame(h!, 12);
    expect(h!.currentTime).toBe(0.5);
});
