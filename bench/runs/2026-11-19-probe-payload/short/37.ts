import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";

test("a 2 s clip on position.x and alpha, played from 0.5 s to 1 s", () => {
    const target = { position: { x: 0 }, alpha: 1 };
    const clip = createPropertyAnimationClip("slide", [
        { path: "position.x", keys: [{ time: 0, value: 0 }, { time: 2, value: 10 }] },
        { path: "alpha", keys: [{ time: 0, value: 1 }, { time: 1, value: 0 }] },
    ]);
    const group = createPropertyAnimationGroup(createAnimationManager(), target, clip, { fromTime: 0.5, toTime: 1 });
    expect(group.targetedAnimations).toEqual([{ target: target.position, path: "x" }, { target, path: "alpha" }]);
    expect(group.targetedAnimations[0]!.target).toBe(target.position);
    expect(group.duration).toBe(2);
});
