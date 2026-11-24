import {
    addToScene,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

/**
 * Puts the sun into the scene (once) and gives it a PCF shadow map.
 * The returned generator is left for the caller to configure casters and receivers.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    const shadowGenerator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: 2048,
        // Re-render the shadow map on every shadow pass rather than only when inputs change.
        forceRefreshEveryFrame: true,
    });

    sun.shadowGenerator = shadowGenerator;
    if (!scene.shadowGenerators.includes(shadowGenerator)) {
        addToScene(scene, shadowGenerator);
    }

    return shadowGenerator;
}
