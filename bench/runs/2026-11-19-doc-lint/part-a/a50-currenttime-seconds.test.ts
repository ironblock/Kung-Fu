// a-50, line 188: "currentTime: number; // seconds"
import { addAnimationGroup, createAnimationGroups, createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { data, moveClip } from "./_fx.ts";

test("group.currentTime is in seconds", () => {
    const g = createAnimationGroups(data([moveClip()]).data)[0]!;
    const manager = createAnimationManager();
    addAnimationGroup(manager, g);
    updateAnimationManager(manager, 500);
    expect(g.currentTime).toBeCloseTo(0.5, 6);
});
