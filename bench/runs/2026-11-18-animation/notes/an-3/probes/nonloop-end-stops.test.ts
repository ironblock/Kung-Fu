import { expect, it } from "vitest";
import { updateAnimationManager } from "@babylonjs/lite";
import { rampGroup } from "./_lib";

it("a non-looping group clamps at toTime, writes that value, then stops and writes nothing more", () => {
    const { manager, target, group } = rampGroup({ loop: false });
    updateAnimationManager(manager, 1500);
    expect(group.currentTime).toBe(1);
    expect(target.value).toBe(10);
    expect(group.isPlaying).toBe(false);
    target.value = 99;
    updateAnimationManager(manager, 100);
    expect(target.value).toBe(99);

    const ranged = rampGroup({ loop: false, toTime: 0.5 });
    updateAnimationManager(ranged.manager, 800);
    expect(ranged.target.value).toBeCloseTo(5);
    expect(ranged.group.isPlaying).toBe(false);
});
