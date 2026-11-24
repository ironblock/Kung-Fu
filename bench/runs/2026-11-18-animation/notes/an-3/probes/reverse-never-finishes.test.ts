import { expect, it } from "vitest";
import { updateAnimationManager } from "@babylonjs/lite";
import { rampGroup } from "./_lib";

it("a negative speedRatio plays backwards; without loop it clamps at fromTime and isPlaying stays true", () => {
    const looping = rampGroup({ speedRatio: -1 });
    updateAnimationManager(looping.manager, 250);
    expect(looping.group.currentTime).toBeCloseTo(0.75);
    expect(looping.target.value).toBeCloseTo(7.5);

    const once = rampGroup({ speedRatio: -1, loop: false, fromTime: 0.2 });
    updateAnimationManager(once.manager, 500);
    expect(once.group.currentTime).toBe(0.2);
    expect(once.target.value).toBeCloseTo(2);
    expect(once.group.isPlaying).toBe(true);
});
