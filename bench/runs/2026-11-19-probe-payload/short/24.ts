import { expect, test } from "vitest";
import { backEase, createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, elasticEase, updateAnimationManager } from "@babylonjs/lite";

test("a backEase track, and two tracks whose easing always returns -100, over 2 s", () => {
    expect(elasticEase(0.5)).toBe(-0.12899432494498259);
    const manager = createAnimationManager();
    const minus100 = () => -100;
    const t = { back: 0, step: 0, late: 0 };
    createPropertyAnimationGroup(manager, t, createPropertyAnimationClip("c", [
        { path: "back", easing: backEase, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] },
        { path: "step", interpolation: "step", easing: minus100, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }, { time: 2, value: 20 }] },
        { path: "late", easing: minus100, keys: [{ time: 0.5, value: 0 }, { time: 1, value: 10 }] },
    ]), { loop: false });
    updateAnimationManager(manager, 250);
    expect(t).toEqual({ back: -1.6115169525146484, step: 0, late: 0 });
    updateAnimationManager(manager, 500);
    expect(t).toEqual({ back: -1.0845508575439453, step: 0, late: -1000 });
    updateAnimationManager(manager, 250);
    expect(t).toEqual({ back: 10, step: 10, late: 10 });
    updateAnimationManager(manager, 1000);
    expect(t).toEqual({ back: 10, step: 20, late: 10 });
});
