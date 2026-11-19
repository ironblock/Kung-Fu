// c-01. Line 553: "`createAnimationGroups()` creates one `AnimationGroup` per `AnimationClip`."
// Checked: three clips give three groups, in clip order, each named for its clip and as long as it.
import { createAnimationGroups } from "@babylonjs/lite";
import { gltf, moveClip, rest } from "./_fx";

test("one group per clip", () => {
    const groups = createAnimationGroups(gltf([moveClip("a", 0, 1, 1), moveClip("b", 0, 1, 2), moveClip("c", 0, 1, 3)], [rest()]));
    expect(groups.map((g) => g.name)).toEqual(["a", "b", "c"]);
    expect(groups.map((g) => g.duration)).toEqual([1, 2, 3]);
});
