import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame } from "@babylonjs/lite";

test("a linear track keyed 10 at 1 s and 20 at 2 s, and a step track keyed 0, 10, 20 at 0, 1, 2 s, sampled at set times", () => {
    const target = { lin: -1, step: -1 };
    const clip = createPropertyAnimationClip("c", [
        { path: "lin", keys: [{ time: 1, value: 10 }, { time: 2, value: 20 }] },
        { path: "step", interpolation: "step", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }, { time: 2, value: 20 }] },
    ]);
    const group = createPropertyAnimationGroup(createAnimationManager(), target, clip, { toTime: 10 });
    expect(group.frameRate).toBe(60);
    const at = (s: number) => (goToFrame(group, s * 60), { ...target });
    expect(at(0)).toEqual({ lin: 10, step: 0 });
    expect(at(0.99)).toEqual({ lin: 10, step: 0 });
    expect(at(1)).toEqual({ lin: 10, step: 10 });
    expect(at(1.5)).toEqual({ lin: 15, step: 10 });
    expect(at(2)).toEqual({ lin: 20, step: 20 });
    expect(at(5)).toEqual({ lin: 20, step: 20 });
});
