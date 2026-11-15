import { addToScene, createDirectionalLight, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

export function createValleySun(engine: EngineContext, scene: SceneContext, direction: [number, number, number]): { sun: DirectionalLight; shadows: ShadowGenerator } {
    // A directional light has no position that matters; the PCF map fits itself to the casters.
    const sun = createDirectionalLight(direction, 1.3);
    const shadows = createPcfDirectionalShadowGenerator(engine, sun, { mapSize: 2048 });
    sun.shadowGenerator = shadows;
    addToScene(scene, sun);
    return { sun, shadows };
}
