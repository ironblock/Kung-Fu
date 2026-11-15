import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

const SUN_SHADOW_MAP_SIZE = 2048;

/**
 * Puts the sun in the scene (only once) and gives it a PCF directional shadow map.
 * The caller is responsible for setting casters and receivers on the returned generator.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    // addToScene does not check membership, so guard against adding the sun twice.
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    const generator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SUN_SHADOW_MAP_SIZE,
        // Re-render the map on every shadow pass instead of reusing the cached one.
        forceRefreshEveryFrame: true,
    });

    // Creating a generator does not attach it; the shadow pass finds it through the light.
    sun.shadowGenerator = generator;

    return generator;
}
