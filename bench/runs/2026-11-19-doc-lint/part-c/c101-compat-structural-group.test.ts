// c-101. Lines 711-714: "The structural multi-target `AnimationGroup` path also remains compat-owned because its
// rest-pose-weighted mixer and mutable lifecycle do not yet match Lite's single-target property group and opt-in mixer
// semantics."
// Compat package. Checked, the ownership: a compat AnimationGroup built with addTargetedAnimation over two targets and
// started gets no Lite group, no Lite manager is made for it, and the scene's frames still animate both targets.
import { AnimationGroup, frame, liteManager, makeScene, ramp } from "./_compat";

test("structural groups stay on compat", () => {
    const scene = makeScene();
    const t1 = { v: -1 };
    const t2 = { v: -1 };
    const group = new AnimationGroup("g", scene);
    group.addTargetedAnimation(ramp(), t1);
    group.addTargetedAnimation(ramp("v", 20), t2);
    group.start(true);
    expect(group._lite).toBeUndefined();
    expect(liteManager(scene)).toBeUndefined();
    frame(scene, 500);
    expect(t1.v).toBeCloseTo(5, 5);
    expect(t2.v).toBeCloseTo(10, 5);
});
