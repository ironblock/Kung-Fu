// b-27. Line 360: "Fixed curves can be passed directly as `PropertyAnimationTrackOptions.easing`."
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, cubicEase, goToFrame, quadraticEase, sineEase } from "@babylonjs/lite";

test("quadraticEase, cubicEase and sineEase work as a track's easing as they are", () => {
    const target = { a: -1, b: -1, c: -1 };
    const keys = [{ time: 0, value: 0 }, { time: 1, value: 10 }];
    const clip = createPropertyAnimationClip(
        "c",
        [
            { path: "a", easing: quadraticEase, keys },
            { path: "b", easing: cubicEase, keys },
            { path: "c", easing: sineEase, keys },
        ],
        { frameRate: 2 }
    );
    goToFrame(createPropertyAnimationGroup(createAnimationManager(), target, clip), 1);
    expect(target.a).toBe(2.5);
    expect(target.b).toBe(1.25);
    expect(target.c).toBeCloseTo(10 * (1 - Math.sin(Math.PI / 4)), 5);
});
