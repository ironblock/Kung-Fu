import {
    addToScene,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

const SUN_SHADOW_MAP_SIZE = 2048;

/**
 * Puts `sun` into `scene` (only once) and gives it a PCF shadow map of
 * 2048 texels square. The shadow map is re-rendered on every shadow pass.
 *
 * Meshes that cast shadows and receivers are registered by other code on the
 * returned generator; that is not done here.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    // Reuse an existing PCF generator for this sun rather than stacking a second one.
    const existing = sun.shadowGenerator;
    if (existing && existing._shadowType === "pcf") {
        return existing;
    }

    const generator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SUN_SHADOW_MAP_SIZE,
        // Render the shadow map on every shadow pass, not only when it is judged stale.
        forceRefreshEveryFrame: true,
    });

    sun.shadowGenerator = generator;

    if (!scene.shadowGenerators.includes(generator)) {
        addToScene(scene, generator);
    }

    return generator;
}
