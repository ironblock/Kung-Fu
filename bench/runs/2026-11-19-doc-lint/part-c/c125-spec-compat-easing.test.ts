// c-125. Line 755: "**Compat easing facade**: Verify `IEasingFunction | null`, live replacement/clearing, direct and
// structural evaluation, and native scalar/vector/quaternion playback"
// Compat package. Checked: setEasingFunction takes an { ease } object or null (getEasingFunction returns it);
// Animation.evaluate (direct evaluation) and a structural AnimationGroup both use it; delegated scalar, vector and
// quaternion tracks are eased on Lite; replacing and clearing the easing is seen on the next frame.
import { anim, AnimationGroup, AnimationTypes, frame, makeScene, ramp, square, Vector3 } from "./_compat";
import { Quaternion } from "#compat/math/quaternion.ts";

test("easing facade", () => {
    const a = ramp();
    a.setEasingFunction(square);
    expect(a.getEasingFunction()).toBe(square);
    expect(a.evaluate(5)).toBeCloseTo(2.5, 6);
    a.setEasingFunction(null);
    expect(a.getEasingFunction()).toBeNull();
    expect(a.evaluate(5)).toBeCloseTo(5, 6);

    const scene = makeScene();
    const structural = { v: -1 };
    const s = ramp();
    s.setEasingFunction(square);
    const group = new AnimationGroup("g", scene);
    group.addTargetedAnimation(s, structural);
    group.start(true);
    frame(scene, 500);
    expect(structural.v).toBeCloseTo(2.5, 5);

    const target = { v: -1, position: new Vector3(0, 0, 0), rotationQuaternion: new Quaternion(0, 0, 0, 1) };
    const sc = ramp();
    const ve = anim("position", [{ frame: 0, value: new Vector3(0, 0, 0) }, { frame: 10, value: new Vector3(10, 20, 40) }], 10, AnimationTypes.ANIMATIONTYPE_VECTOR3);
    const h = Math.sin(Math.PI / 3);
    const qu = anim("rotationQuaternion", [{ frame: 0, value: new Quaternion(0, 0, 0, 1) }, { frame: 10, value: new Quaternion(0, 0, h, Math.cos(Math.PI / 3)) }], 10, AnimationTypes.ANIMATIONTYPE_QUATERNION);
    for (const x of [sc, ve, qu]) {
        x.setEasingFunction(square);
    }
    const animatable = scene.beginDirectAnimation(target, [sc, ve, qu], 0, 10, true);
    expect(animatable._lite).toBeDefined();
    frame(scene, 500);
    expect(target.v).toBeCloseTo(2.5, 5);
    expect(target.position.y).toBeCloseTo(5, 5);
    expect(target.rotationQuaternion.z).toBeCloseTo(Math.sin(Math.PI / 12), 5);
    sc.setEasingFunction({ ease: (g: number) => g * g * g });
    frame(scene, 0);
    expect(target.v).toBeCloseTo(1.25, 5);
    sc.setEasingFunction(null);
    frame(scene, 0);
    expect(target.v).toBeCloseTo(5, 5);
});
