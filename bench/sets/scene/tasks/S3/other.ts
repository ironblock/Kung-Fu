import { addToScene, createDirectionalLight, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Another right answer: leave the light at the origin and widen the shadow depth range to both sides of it.
export function createValleySun(engine: EngineContext, scene: SceneContext, direction: [number, number, number]): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const sun = createDirectionalLight(direction, 1.3);
    const shadows = createPcfDirectionalShadowGenerator(engine, sun, { mapSize: 2048, orthoMinZ: -2000, orthoMaxZ: 2000 });
    sun.shadowGenerator = shadows;
    addToScene(scene, sun);
    return { sun, shadows };
}
