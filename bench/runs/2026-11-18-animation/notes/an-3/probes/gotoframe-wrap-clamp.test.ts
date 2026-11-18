import { expect, it } from "vitest";
import { createAnimationGroups, goToFrame } from "@babylonjs/lite";
import { rampGroup } from "./_lib";
import { gltfData } from "./_gltf";

it("goToFrame past the end wraps a looping glTF group and clamps a non-looping one; property groups clamp to [0, duration]", () => {
    const { data, targets } = gltfData(1);
    const [g] = createAnimationGroups(data);
    goToFrame(g!, 90);
    expect(g!.currentTime).toBeCloseTo(0.5);
    expect(targets[0]!.p[0]).toBeCloseTo(5);
    g!.loopAnimation = false;
    goToFrame(g!, 90);
    expect(g!.currentTime).toBe(1);

    const { group, target } = rampGroup({ fromTime: 0.4, toTime: 0.6 });
    goToFrame(group, 6);
    expect(group.currentTime).toBeCloseTo(0.1);
    expect(target.value).toBeCloseTo(1);
    goToFrame(group, 90);
    expect(group.currentTime).toBe(1);
    expect(target.value).toBe(10);
    goToFrame(group, -6);
    expect(group.currentTime).toBe(0);
});
