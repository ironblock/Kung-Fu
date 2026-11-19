// a-06, line 7: "Each evaluated clip is wrapped in an `AnimationGroup` and can be driven by a standalone `AnimationManager`, by a scene render loop, or by explicit deterministic updates."
// This probe takes "driven by a scene render loop".
// No GPU: the scene is made by createSceneContext on a fake surface with no default render task.
// The render loop calls the scene's per-frame update (_update) once per frame; this probe calls it as the loop would.
// The groups reach the scene the way the loader hands them over: an asset container passed to addToScene.
import { addToScene, createAnimationGroups, createSceneContext } from "@babylonjs/lite";
import type { AssetContainer } from "@babylonjs/lite";
import { data, moveClip } from "./_fx.ts";

test("a scene frame advances a group added through addToScene", () => {
    const engine = { _currentDelta: 250, useFloatingOrigin: false, _currentEncoder: undefined } as Record<string, unknown>;
    engine.engine = engine;
    const surface = { engine, msaaSamples: 1, format: "bgra8unorm" } as never;
    const scene = createSceneContext(surface, { defaultRenderTask: false }) as unknown as { _update(): void; animationGroups: unknown[] };
    const { data: d, targets } = data([moveClip()]);
    const groups = createAnimationGroups(d);
    addToScene(scene as never, { entities: [], animationGroups: groups } as unknown as AssetContainer);
    scene._update();
    expect(groups[0]!.currentTime).toBeCloseTo(0.25, 6);
    expect(targets[0]!.p[0]).toBeCloseTo(2.5, 5);
});
