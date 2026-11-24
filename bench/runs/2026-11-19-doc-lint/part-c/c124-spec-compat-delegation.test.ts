// c-124. Line 754: "**Compat native delegation**: Verify supported Babylon.js-shaped direct and attached animations are
// advanced and written by a Lite property group, while unsupported independent tracks use the explicit compat fallback"
// Compat package. Checked: a direct call (beginDirectAnimation) and an attached one (beginAnimation over
// target.animations) are each run by a Lite group (its time advances; the value written is its sample); an unsupported
// independent track in the attached call is on the fallback and is still animated.
import { anim, frame, makeScene, ramp, square } from "./_compat";

test("direct and attached delegate; unsupported falls back", () => {
    const scene = makeScene();
    const direct = { v: -1 };
    const d = scene.beginDirectAnimation(direct, [ramp()], 0, 10, true);
    const attached = { v: -1, w: -1, animations: [ramp(), anim("w", [{ frame: 0, value: 0, easingFunction: square }, { frame: 10, value: 10 }])] };
    const a = scene.beginAnimation(attached, 0, 10, true);
    expect(d._lite).toBeDefined();
    expect(a._lite!.targetedAnimations.map((t) => t.path)).toEqual(["v"]);
    expect(a._nativeFallbackReason).toMatch(/"w"/);
    frame(scene, 400);
    expect(d._lite!.currentTime).toBeCloseTo(0.4, 6);
    expect(a._lite!.currentTime).toBeCloseTo(0.4, 6);
    expect(direct.v).toBeCloseTo(4, 5);
    expect(attached.v).toBeCloseTo(4, 5);
    expect(attached.w).toBeCloseTo(1.6, 5);
});
