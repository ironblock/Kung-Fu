import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

/**
 * Puts the sun in the scene (once), gives it a 2048² PCF shadow map and links
 * that map to the sun. Caster meshes and receivers are the caller's job.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    const shadowGenerator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: 2048,
        // Re-render the map on every shadow pass, not only when casters or the light change.
        forceRefreshEveryFrame: true,
    });
    sun.shadowGenerator = shadowGenerator;

    return shadowGenerator;
}
