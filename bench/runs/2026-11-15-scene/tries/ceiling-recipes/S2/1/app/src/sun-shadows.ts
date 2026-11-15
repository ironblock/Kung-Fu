import {
    addToScene,
    createPcfDirectionalShadowGenerator,
    type DirectionalLight,
    type EngineContext,
    type SceneContext,
    type ShadowGenerator,
} from "@babylonjs/lite";

const SUN_SHADOW_MAP_SIZE = 2048;

/**
 * Adds the sun to the scene and gives it a PCF shadow map, 2048 texels square.
 *
 * Callers still need to:
 * - pass the casters with setShadowTaskCasterMeshes(sg, meshes);
 * - set receiveShadows on receivers before the scene is registered (it is
 *   ignored after registration);
 * - call this before registering the scene, and register it with
 *   registerSceneWithShadowSupport (registerScene runs no shadow pass).
 *   If the generator is linked after registration its map is drawn, but
 *   receivers built earlier never sample it.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    // Add the sun only once. Adding it twice would put it in scene.lights twice.
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    const sg = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SUN_SHADOW_MAP_SIZE,
        // Draw the map on every shadow pass, not only when casters or the light change.
        forceRefreshEveryFrame: true,
    });

    // Creating the generator does not attach it to the light, and neither does
    // addToScene(scene, sg). The shadow pass only draws maps that are linked here.
    sun.shadowGenerator = sg;

    return sg;
}
