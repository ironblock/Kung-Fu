import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

/**
 * Puts the sun into the scene (only if it is not there yet) and gives it a
 * PCF directional shadow map of 2048 texels square, created for that sun.
 *
 * The returned generator still needs its caster meshes set by other code
 * (setShadowTaskCasterMeshes). The scene must be registered with
 * registerSceneWithShadowSupport, otherwise nothing renders this map.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    const generator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: 2048,
        // Re-render the map on every frame the shadow pass runs, instead of
        // reusing it while casters and the light stay unchanged.
        forceRefreshEveryFrame: true,
    });

    // The generator renders only once it is assigned to its light.
    sun.shadowGenerator = generator;

    return generator;
}
