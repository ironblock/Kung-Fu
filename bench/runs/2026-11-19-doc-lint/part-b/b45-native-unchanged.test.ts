// b-45. Lines 400-401: "Neither native property-track compilation nor generic glTF `AnimationSampler` data changes."
// Mostly internal. Reading most favourable to the sentence, and the part a user can see: compat's
// per-key easing did not add a per-key easing to Lite. A key-level easing field handed to
// createPropertyAnimationClip is not stored and not used; the compiled sampler holds only input,
// output and interpolation.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

test("Lite property keys take no per-key easing", () => {
    let calls = 0;
    const easing = () => (calls++, 0.9);
    const keys = [{ time: 0, value: 0, easing, easingFunction: { ease: easing } }, { time: 1, value: 10 }] as never;
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys }], { frameRate: 2 });
    expect(Object.keys(clip.tracks[0]!.sampler).sort()).toEqual(["input", "interpolation", "output"]);
    expect(clip.tracks[0]!.easing).toBeUndefined();
    const target = { v: -1 };
    goToFrame(createPropertyAnimationGroup(createAnimationManager(), target, clip), 1);
    expect(target.v).toBe(5);
    expect(calls).toBe(0);
});
