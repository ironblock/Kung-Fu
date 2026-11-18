import { addAnimationGroups, createAnimationGroups, createAnimationManager, enableAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import type { EngineContext } from "@babylonjs/lite";
import { gltfData, recorder } from "./gltf-fixture.ts";

test("with enableAnimationBlending, a playing glTF group of weight not 1 makes updateAnimationManager throw when the manager has no engine", () => {
    const groups = createAnimationGroups(gltfData());
    const manager = createAnimationManager();
    enableAnimationBlending(manager);
    addAnimationGroups(manager, groups);
    updateAnimationManager(manager, 16);
    setAnimationWeight(groups[0]!, 0.5);
    expect(() => updateAnimationManager(manager, 16)).toThrow("Weighted glTF animation requires an AnimationManager engine");
});

test("with an engine, weighted glTF groups do not write their node targets; only skeleton bones are blended", () => {
    const targets = [recorder(), recorder()];
    const groups = createAnimationGroups(gltfData(targets));
    const engine = { _device: { queue: { writeTexture: () => {} } } } as unknown as EngineContext;
    const manager = createAnimationManager({ engine });
    enableAnimationBlending(manager);
    addAnimationGroups(manager, groups);
    setAnimationWeight(groups[0]!, 0.5);
    updateAnimationManager(manager, 500);
    expect(groups[0]!.currentTime).toBe(0.5);
    expect(targets[0]!.writes).toBe(0);
    setAnimationWeight(groups[0]!, 1);
    updateAnimationManager(manager, 0);
    expect(targets[0]!.p).toEqual([5, 0, 0]);
});
