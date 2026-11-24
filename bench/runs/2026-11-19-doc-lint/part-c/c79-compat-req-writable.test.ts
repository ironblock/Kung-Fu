// c-79. Lines 658-659: requirement "a target path whose existing leaf is writable by the native scalar or `.set(...)`
// vector/quaternion binding;"
// Compat package. Checked: a number leaf and a Vector3 leaf (has set) are delegated; a missing leaf, a string leaf and a
// plain {x,y,z} leaf with no set are not.
import { anim, AnimationTypes, makeScene, Vector3 } from "./_compat";

const V3 = AnimationTypes.ANIMATIONTYPE_VECTOR3;
const floatKeys = [{ frame: 0, value: 0 }, { frame: 10, value: 1 }];
const vecKeys = [{ frame: 0, value: [0, 0, 0] }, { frame: 10, value: [1, 1, 1] }];

test("writable leaves only", () => {
    const scene = makeScene();
    const begin = (target: object, path: string, vector = false) => scene.beginDirectAnimation(target, [anim(path, vector ? vecKeys : floatKeys, 10, vector ? V3 : 0)], 0, 10, true)._lite;
    expect(begin({ v: 0 }, "v")).toBeDefined();
    expect(begin({ position: new Vector3(0, 0, 0) }, "position", true)).toBeDefined();
    expect(begin({}, "missing")).toBeUndefined();
    expect(begin({ label: "a" }, "label")).toBeUndefined();
    expect(begin({ position: { x: 0, y: 0, z: 0 } }, "position", true)).toBeUndefined();
});
