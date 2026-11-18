import { expect, it } from "vitest";
import { goToFrame, pauseAnimation, playAnimation, updateAnimationManager } from "@babylonjs/lite";
import { rampGroup } from "./_lib";

it("a paused property group writes nothing, even after currentTime is set; goToFrame or an update after playAnimation writes", () => {
    const { manager, target, group } = rampGroup();
    updateAnimationManager(manager, 200);
    pauseAnimation(group);
    target.value = 50;
    updateAnimationManager(manager, 200);
    expect(target.value).toBe(50);
    expect(group.currentTime).toBeCloseTo(0.2);
    group.currentTime = 0.8;
    updateAnimationManager(manager, 0);
    expect(target.value).toBe(50);
    goToFrame(group, 30);
    expect(target.value).toBe(5);
    group.currentTime = 0.8;
    playAnimation(group);
    updateAnimationManager(manager, 0);
    expect(target.value).toBeCloseTo(8);
});
