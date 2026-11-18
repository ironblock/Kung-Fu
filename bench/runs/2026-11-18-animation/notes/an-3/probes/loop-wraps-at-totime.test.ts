import { expect, it } from "vitest";
import { updateAnimationManager } from "@babylonjs/lite";
import { rampGroup } from "./_lib";

it("a looping group landing exactly on toTime writes the fromTime value", () => {
    const { manager, target, group } = rampGroup();
    updateAnimationManager(manager, 250);
    updateAnimationManager(manager, 750);
    expect(group.currentTime).toBe(0);
    expect(target.value).toBe(0);

    const ranged = rampGroup({ fromTime: 0.2, toTime: 0.6 });
    updateAnimationManager(ranged.manager, 400);
    expect(ranged.group.currentTime).toBeCloseTo(0.2);
    expect(ranged.target.value).toBeCloseTo(2);
});
