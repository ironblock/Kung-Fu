// c-89. Line 678: "Scene disposal clears compat-owned managers."
// Compat package. Checked: after scene.dispose(), the scene's Lite manager holds no groups and the delegated group no
// longer names an owning manager.
import { getAnimationGroups } from "@babylonjs/lite";
import { liteManager, makeScene, ramp } from "./_compat";

test("dispose empties the manager", () => {
    const scene = makeScene();
    const a = scene.beginDirectAnimation({ v: 0 }, [ramp()], 0, 10, true);
    const manager = liteManager(scene)!;
    expect(getAnimationGroups(manager)).toEqual([a._lite]);
    scene.dispose();
    expect(getAnimationGroups(manager)).toEqual([]);
    expect(manager.animations).toEqual([]);
    expect(a._lite!._animationManager).toBeUndefined();
});
