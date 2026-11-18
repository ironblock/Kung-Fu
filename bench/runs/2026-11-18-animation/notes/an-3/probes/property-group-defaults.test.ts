import { expect, it } from "vitest";
import { updateAnimationManager } from "@babylonjs/lite";
import { rampGroup } from "./_lib";

it("createPropertyAnimationGroup loops by default, with speedRatio 1 and weight 1", () => {
    const { manager, group, target } = rampGroup();
    expect(group.loopAnimation).toBe(true);
    expect(group.speedRatio).toBe(1);
    expect(group.weight).toBe(1);
    updateAnimationManager(manager, 1250);
    expect(group.isPlaying).toBe(true);
    expect(group.currentTime).toBeCloseTo(0.25);
    expect(target.value).toBeCloseTo(2.5);

    const once = rampGroup({ loop: false });
    updateAnimationManager(once.manager, 1250);
    expect(once.group.isPlaying).toBe(false);
    expect(once.target.value).toBe(10);
});
