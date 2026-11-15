import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

/**
 * Puts the sun into the scene (once) and gives it a PCF shadow map of 2048 texels.
 * Casters and receivers are configured by the caller on the returned generator.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    const generator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: 2048,
        // Re-render the shadow map on every shadow pass, not only when something changed.
        forceRefreshEveryFrame: true,
    });

    addToScene(scene, generator);
    return generator;
}
