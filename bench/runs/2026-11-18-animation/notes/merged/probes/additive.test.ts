import {
    addAnimationGroup,
    createAnimationGroups,
    createAnimationManager,
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    enablePropertyAnimationBlending,
    setAnimationAdditive,
    setAnimationWeight,
    updateAnimationManager,
} from "@babylonjs/lite";
import type { EngineContext } from "@babylonjs/lite";
import { gltfData } from "./gltf-fixture.ts";

test("an additive glTF group in the mix makes updateAnimationManager throw when the manager has no engine", () => {
    const manager = createAnimationManager();
    const [g] = createAnimationGroups(gltfData());
    addAnimationGroup(manager, g!);
    setAnimationAdditive(g!);
    expect(() => updateAnimationManager(manager, 16)).toThrow("Weighted glTF animation requires an AnimationManager engine");
});

test("setAnimationAdditive throws when both referenceFrame and referenceTime are given, or the time is negative", () => {
    const [g] = createAnimationGroups(gltfData());
    expect(() => setAnimationAdditive(g!, { referenceFrame: 1, referenceTime: 1 })).toThrow(
        "Additive animation reference must use either referenceFrame or referenceTime, not both"
    );
    expect(() => setAnimationAdditive(g!, { referenceTime: -1 })).toThrow("Additive animation reference time must be a finite non-negative number, got -1");
});

test("setAnimationAdditive on an attached group switches its manager to enableAnimationBlending, so property weights stop counting", () => {
    const engine = { _device: { queue: { writeTexture: () => {} } } } as unknown as EngineContext;
    const manager = createAnimationManager({ engine });
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    const p = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 10 }, { time: 1, value: 10 }] }]));
    setAnimationWeight(p, 0.5);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(5);
    const [g] = createAnimationGroups(gltfData());
    addAnimationGroup(manager, g!);
    setAnimationAdditive(g!);
    g!.isPlaying = false;
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(10);
});
