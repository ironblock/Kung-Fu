import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

/** Edge length, in texels, of the sun's square shadow map. */
const SUN_SHADOW_MAP_SIZE = 2048;

/**
 * Adds the sun to the scene and gives it a PCF shadow map.
 *
 * The caller still has to:
 * - set the casters with setShadowTaskCasterMeshes(sg, [...]);
 * - set receiveShadows = true on receivers *before* the scene is registered
 *   (a later change is not picked up);
 * - start the scene with registerSceneWithShadowSupport(scene). With plain
 *   registerScene there is no shadow task, so no map is ever drawn.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    // Add the sun only once, even if this is called twice for the same scene.
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    // By default the map is only redrawn when a caster or the light changes.
    // forceRefreshEveryFrame makes every shadow pass redraw it.
    const sg = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SUN_SHADOW_MAP_SIZE,
        forceRefreshEveryFrame: true,
    });

    // Creating the generator does not attach it to the light, and
    // addToScene(scene, sg) would not either. Without this line no map is
    // drawn or sampled.
    sun.shadowGenerator = sg;

    return sg;
}
