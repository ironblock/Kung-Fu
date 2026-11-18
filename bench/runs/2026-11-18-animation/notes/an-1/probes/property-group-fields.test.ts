// Note: targetedAnimations holds {target, path}: the owner of the last path part and that part; duration is the whole clip even with a narrower range; name and frameRate come from the clip.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";

it("fields", () => {
    const target = { position: { x: 0 }, alpha: 1 };
    const clip = createPropertyAnimationClip("slide", [
        { path: "position.x", keys: [{ time: 0, value: 0 }, { time: 2, value: 10 }] },
        { path: "alpha", keys: [{ time: 0, value: 1 }, { time: 1, value: 0 }] },
    ], { frameRate: 24 });
    const group = createPropertyAnimationGroup(createAnimationManager(), target, clip, { fromTime: 0.5, toTime: 1 });
    expect(group.targetedAnimations).toEqual([{ target: target.position, path: "x" }, { target, path: "alpha" }]);
    expect(group.targetedAnimations[0]!.target).toBe(target.position);
    expect(group.duration).toBe(2);
    expect(group.name).toBe("slide");
    expect(group.frameRate).toBe(24);
});
