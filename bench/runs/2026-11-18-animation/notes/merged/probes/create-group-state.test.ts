// Note: createPropertyAnimationGroup attaches, plays, loops by default; writes nothing until the next update.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, getAnimationGroups, updateAnimationManager } from "@babylonjs/lite";

it("starts playing and looping, attached, with no write yet", () => {
    const manager = createAnimationManager();
    const target = { v: 7 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip);
    expect(group.isPlaying).toBe(true);
    expect(group.loopAnimation).toBe(true);
    expect(getAnimationGroups(manager)).toEqual([group]);
    expect(target.v).toBe(7);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(0);

    const once = createPropertyAnimationGroup(manager, { v: 0 }, clip, { loop: false });
    expect(once.loopAnimation).toBe(false);
});
