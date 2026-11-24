import { expect, it } from "vitest";
import { createAnimationGroups, createNullEngine, goToFrame } from "@babylonjs/lite";
import { gltfData } from "./_gltf";

it("goToFrame on a stopped glTF group writes nothing unless an engine is passed", () => {
    const { data, targets } = gltfData(2);
    const [, second] = createAnimationGroups(data);
    goToFrame(second!, 30);
    expect(second!.currentTime).toBe(0.5);
    expect(targets[0]!.writes).toBe(0);
    goToFrame(second!, 30, createNullEngine());
    expect(targets[0]!.p[0]).toBeCloseTo(10);
});
