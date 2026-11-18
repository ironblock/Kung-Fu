import { expect, it } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, createNullEngine, enableAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { thrown } from "./_lib";
import { gltfData } from "./_gltf";

it("under enableAnimationBlending a glTF group with weight not 1 needs a manager engine, and then does not write node targets", () => {
    const first = gltfData(1);
    const [g] = createAnimationGroups(first.data);
    const bare = createAnimationManager();
    addAnimationGroup(bare, g!);
    enableAnimationBlending(bare);
    setAnimationWeight(g!, 0.5);
    expect(thrown(() => updateAnimationManager(bare, 250))).toMatch(/requires an AnimationManager engine/);

    const { data, targets } = gltfData(1);
    const [h] = createAnimationGroups(data);
    const manager = createAnimationManager({ engine: createNullEngine() });
    addAnimationGroup(manager, h!);
    enableAnimationBlending(manager);
    setAnimationWeight(h!, 0.5);
    updateAnimationManager(manager, 250);
    expect(h!.currentTime).toBe(0.25);
    expect(targets[0]!.writes).toBe(0);
    setAnimationWeight(h!, 1);
    updateAnimationManager(manager, 250);
    expect(targets[0]!.p[0]).toBeCloseTo(5);
});
