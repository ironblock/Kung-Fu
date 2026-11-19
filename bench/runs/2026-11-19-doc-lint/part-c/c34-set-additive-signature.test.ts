// c-34. Line 588: "Additive groups are marked with `setAnimationAdditive(group, { referenceFrame })`."
// Checked: the package exports setAnimationAdditive, and it accepts a group and { referenceFrame } without error.
import * as Lite from "@babylonjs/lite";
import { gltf, moveClip, rest } from "./_fx";

test("setAnimationAdditive(group, { referenceFrame }) exists", () => {
    expect(typeof Lite.setAnimationAdditive).toBe("function");
    const [group] = Lite.createAnimationGroups(gltf([moveClip("a", 0, 10)], [rest()]));
    expect(() => Lite.setAnimationAdditive(group!, { referenceFrame: 30 })).not.toThrow();
});
