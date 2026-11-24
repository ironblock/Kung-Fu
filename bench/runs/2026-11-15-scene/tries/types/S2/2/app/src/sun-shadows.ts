import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";
import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";

/**
 * Give the sun a PCF shadow map (2048 texels square) and put it in the scene.
 *
 * - The sun is added to the scene only if it is not already there.
 * - The shadow generator is created once per sun and reused on later calls.
 * - `forceRefreshEveryFrame` is set so the shadow map is re-rendered every time the
 *   scene's shadow pass runs.
 *
 * Caster and receiver registration is left to the caller.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    let generator = sun.shadowGenerator;
    if (generator !== undefined) {
        if (generator._shadowType !== "pcf") {
            throw new Error(`addSunShadows: sun already has a ${generator._shadowType} shadow generator; expected pcf`);
        }
    } else {
        generator = createPcfDirectionalShadowGenerator(engine, sun, {
            mapSize: 2048,
            forceRefreshEveryFrame: true,
        });
        sun.shadowGenerator = generator;
    }

    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }
    if (!scene.shadowGenerators.includes(generator)) {
        addToScene(scene, generator);
    }

    return generator;
}
