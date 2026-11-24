// b-18. Line 325: "The callback is retained on the compiled property track rather than baked into sample data."
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

test("the compiled track holds the callback; the sample data are the raw keys; the callback runs at sample time", () => {
    let power = 2;
    const easing = (g: number) => Math.pow(g, power);
    const clip = createPropertyAnimationClip("c", [{ path: "v", easing, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }], { frameRate: 2 });
    expect(clip.tracks[0]!.easing).toBe(easing);
    expect(Array.from(clip.tracks[0]!.sampler.output)).toEqual([0, 10]);
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(createAnimationManager(), target, clip);
    goToFrame(group, 1);
    expect(target.v).toBe(2.5);
    power = 1;
    goToFrame(group, 1);
    expect(target.v).toBe(5);
});
