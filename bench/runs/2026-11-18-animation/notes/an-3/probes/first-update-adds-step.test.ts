import { expect, it } from "vitest";
import { updateAnimationManager } from "@babylonjs/lite";
import { rampGroup } from "./_lib";

it("nothing is written at creation; the first update writes the value at fromTime + step; an update of 0 writes the value at fromTime", () => {
    const a = rampGroup();
    expect(a.target.value).toBe(-1);
    updateAnimationManager(a.manager, 250);
    expect(a.target.value).toBeCloseTo(2.5);

    const b = rampGroup({ fromTime: 0.5 });
    expect(b.target.value).toBe(-1);
    updateAnimationManager(b.manager, 100);
    expect(b.target.value).toBeCloseTo(6);

    const c = rampGroup({ fromTime: 0.5 });
    updateAnimationManager(c.manager, 0);
    expect(c.group.currentTime).toBe(0.5);
    expect(c.target.value).toBeCloseTo(5);
});
