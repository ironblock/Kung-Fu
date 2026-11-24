import {
    addToScene,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

/**
 * Puts the sun in the scene (once), gives it a 2048x2048 PCF shadow map and
 * links that map to the sun. The shadow map is re-rendered every frame the
 * shadow pass runs, rather than only when the casters or the light change.
 * Caster meshes and receivers are set up by the caller.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    const sg = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: 2048,
        forceRefreshEveryFrame: true,
    });
    // Creating the generator does not link it to the light; without this the
    // sun casts no shadow map.
    sun.shadowGenerator = sg;

    return sg;
}
