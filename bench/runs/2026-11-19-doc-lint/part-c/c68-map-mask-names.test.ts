// c-68. Line 640 (map row): `AnimationGroupMask` / `AnimationGroupMaskMode` / `mask.retainsTarget(name)` correspond to
// `AnimationGroupMask` / `AnimationGroupMaskMode` / `animationGroupMaskRetainsTarget(mask, name)`.
// Checked: AnimationGroupMaskMode and animationGroupMaskRetainsTarget are exported; the latter answers by mode
// (Include keeps only the names, Exclude keeps all but the names). AnimationGroupMask is a type and is not checked here.
import * as Lite from "@babylonjs/lite";

test("mask names and retainsTarget", () => {
    expect(Lite.AnimationGroupMaskMode).toBeDefined();
    const include = Lite.createAnimationGroupMask(["a"], Lite.AnimationGroupMaskMode.Include);
    const exclude = Lite.createAnimationGroupMask(["a"], Lite.AnimationGroupMaskMode.Exclude);
    expect([Lite.animationGroupMaskRetainsTarget(include, "a"), Lite.animationGroupMaskRetainsTarget(include, "b")]).toEqual([true, false]);
    expect([Lite.animationGroupMaskRetainsTarget(exclude, "a"), Lite.animationGroupMaskRetainsTarget(exclude, "b")]).toEqual([false, true]);
});
