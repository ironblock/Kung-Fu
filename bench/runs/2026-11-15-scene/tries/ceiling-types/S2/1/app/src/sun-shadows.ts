import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

const SUN_SHADOW_MAP_SIZE = 2048;

/**
 * Put the sun in the scene and give it a 2048×2048 PCF shadow map.
 *
 * Casters and receivers are left to the caller.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    const generator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SUN_SHADOW_MAP_SIZE,
        // Without this the map is only redrawn when a caster or the light changes.
        forceRefreshEveryFrame: true,
    });

    // Attach the generator before the light enters the scene, so the scene sees a shadow-casting light.
    sun.shadowGenerator = generator;

    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }
    // Adding a light may already register its attached generator; never register it twice.
    if (!scene.shadowGenerators.includes(generator)) {
        addToScene(scene, generator);
    }

    return generator;
}
