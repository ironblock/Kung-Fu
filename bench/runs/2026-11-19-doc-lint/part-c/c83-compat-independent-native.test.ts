// c-83. Lines 665-666: "Supported tracks remain native even when another independent track in the same call is
// unsupported."
// Compat package. Checked: an unsupported track (COLOR3 data on "tint") next to a supported float track "v" on another
// property: "v" is on a Lite group that the scene's manager drives, and Lite advances it.
import { anim, attached, AnimationTypes, frame, makeScene, ramp } from "./_compat";

test("an independent supported track stays native", () => {
    const scene = makeScene();
    const target = { v: -1, tint: { r: 0, g: 0, b: 0 } };
    const tint = anim("tint", [{ frame: 0, value: [0, 0, 0] }, { frame: 10, value: [1, 1, 1] }], 10, AnimationTypes.ANIMATIONTYPE_COLOR3);
    const animatable = scene.beginDirectAnimation(target, [ramp("v"), tint], 0, 10, true);
    expect(animatable._lite).toBeDefined();
    expect(attached(scene)).toContain(animatable._lite);
    frame(scene, 300);
    expect(animatable._lite!.currentTime).toBeCloseTo(0.3, 6);
    expect(target.v).toBeCloseTo(3, 5);
});
