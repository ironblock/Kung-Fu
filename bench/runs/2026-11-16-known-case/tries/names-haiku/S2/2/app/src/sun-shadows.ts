import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    // Put the sun in the scene once.
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    // PCF shadow map, 2048 texels square, created for this sun.
    // forceRefreshEveryFrame makes the shadow pass re-render the map every frame.
    const shadowGenerator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: 2048,
        forceRefreshEveryFrame: true,
    });

    // Link the generator to the light and register it with the scene.
    sun.shadowGenerator = shadowGenerator;
    if (!scene.shadowGenerators.includes(shadowGenerator)) {
        addToScene(scene, shadowGenerator);
    }

    return shadowGenerator;
}
