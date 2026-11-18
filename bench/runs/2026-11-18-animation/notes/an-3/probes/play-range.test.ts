import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";
import { thrown } from "./_lib";

it("fromTime/toTime win over frames; currentTime starts at fromTime; toTime must exceed fromTime, so a clip with all keys at 0 needs toTime", () => {
    const clip = createPropertyAnimationClip("c", [{ path: "v", frameRate: 10, keys: [{ frame: 0, value: 0 }, { frame: 20, value: 20 }] }]);
    const g = createPropertyAnimationGroup(createAnimationManager(), { v: 0 }, clip, { fromTime: 0.2, fromFrame: 15, toFrame: 18 });
    expect(g.currentTime).toBe(0.2);
    const h = createPropertyAnimationGroup(createAnimationManager(), { v: 0 }, clip, { fromFrame: 5, toFrame: 15 });
    expect(h.currentTime).toBe(0.5);
    expect(thrown(() => createPropertyAnimationGroup(createAnimationManager(), { v: 0 }, clip, { fromTime: 1, toTime: 1 }))).toMatch(/toTime greater than fromTime/);

    const still = createPropertyAnimationClip("still", [{ path: "v", keys: [{ time: 0, value: 7 }] }]);
    expect(still.duration).toBe(0);
    expect(thrown(() => createPropertyAnimationGroup(createAnimationManager(), { v: 0 }, still))).toMatch(/toTime greater than fromTime/);
    const m = createAnimationManager();
    const t = { v: 0 };
    createPropertyAnimationGroup(m, t, still, { toTime: 1 });
    updateAnimationManager(m, 100);
    expect(t.v).toBe(7);
});
