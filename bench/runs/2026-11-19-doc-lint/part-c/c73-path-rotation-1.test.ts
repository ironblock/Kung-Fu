// c-73. Line 645 (map row): `Animation.ANIMATIONTYPE_QUATERNION` corresponds to `PATH_ROTATION = 1`.
// PATH_ROTATION is not exported by the package (an internal name). Its user-visible effect is checked: a hand-made glTF
// channel with path 1 is a rotation channel (listed as "rotation" and written to rotationQuaternion).
import * as Lite from "@babylonjs/lite";
import { gltf, nodeRecorder, rest, turnClip, zq } from "./_fx";

test("channel path 1 is rotation", () => {
    expect("PATH_ROTATION" in Lite).toBe(false);
    const node = nodeRecorder();
    const [g] = Lite.createAnimationGroups(gltf([turnClip("t", 90)], [rest()], { targets: [node] }));
    expect(g!.targetedAnimations[0]!.path).toBe("rotation");
    const manager = Lite.createAnimationManager();
    Lite.addAnimationGroup(manager, g!);
    Lite.updateAnimationManager(manager, 100);
    node.r.forEach((c, i) => expect(c).toBeCloseTo(zq(90)[i]!, 5));
});
