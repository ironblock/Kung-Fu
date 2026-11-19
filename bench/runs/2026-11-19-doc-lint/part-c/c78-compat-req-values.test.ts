// c-78. Lines 656-657: requirement "finite scalar values, fixed-size arrays, or Babylon.js-shaped Vector2, Vector3, or
// Quaternion values;"
// Compat package. Checked: finite scalars, 3-number arrays on a Vector3 track, and compat Vector3 values are delegated;
// a NaN scalar and a 2-number array on a Vector3 track are not.
import { anim, AnimationTypes, makeScene, Vector3 } from "./_compat";

const V3 = AnimationTypes.ANIMATIONTYPE_VECTOR3;
const target = () => ({ v: 0, position: new Vector3(0, 0, 0) });

test("supported value shapes", () => {
    const scene = makeScene();
    expect(scene.beginDirectAnimation(target(), [anim("v", [{ frame: 0, value: 0 }, { frame: 10, value: 1 }])], 0, 10, true)._lite).toBeDefined();
    expect(scene.beginDirectAnimation(target(), [anim("position", [{ frame: 0, value: [0, 0, 0] }, { frame: 10, value: [1, 2, 3] }], 10, V3)], 0, 10, true)._lite).toBeDefined();
    expect(scene.beginDirectAnimation(target(), [anim("position", [{ frame: 0, value: new Vector3(0, 0, 0) }, { frame: 10, value: new Vector3(1, 2, 3) }], 10, V3)], 0, 10, true)._lite).toBeDefined();
    expect(scene.beginDirectAnimation(target(), [anim("v", [{ frame: 0, value: 0 }, { frame: 10, value: NaN }])], 0, 10, true)._lite).toBeUndefined();
    expect(scene.beginDirectAnimation(target(), [anim("position", [{ frame: 0, value: [0, 0] }, { frame: 10, value: [1, 2] }], 10, V3)], 0, 10, true)._lite).toBeUndefined();
});
