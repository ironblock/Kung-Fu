import { addToScene, createPcfDirectionalShadowGenerator, rebuildSceneRenderables } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

const SUN_SHADOW_MAP_SIZE = 2048;

/**
 * Puts the sun in the scene (only if it is not there yet) and gives it a
 * 2048x2048 PCF shadow map. Choosing casters and marking receivers is left
 * to the caller.
 *
 * The shadow pass only exists if the scene is registered with
 * registerSceneWithShadowSupport (registerScene adds no shadow task). The map
 * is also not drawn until setShadowTaskCasterMeshes(sg, list) has run, even
 * with an empty list.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    // Only add the sun once. The generator renders only while its light is in scene.lights.
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    const generator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SUN_SHADOW_MAP_SIZE,
        // Redraw the map every time the shadow pass runs, not only when casters or the light change.
        forceRefreshEveryFrame: true,
    });

    // addToScene(scene, generator) would do nothing. The shadow task finds the map through the light.
    sun.shadowGenerator = generator;

    // Material groups that are already built don't pick up a new light or shadow generator.
    // So if the scene has already been built, rebuild its renderables.
    if (scene._built) {
        rebuildSceneRenderables(scene).catch((error: unknown) => {
            console.error("addSunShadows: rebuilding scene renderables failed", error);
        });
    }

    return generator;
}
