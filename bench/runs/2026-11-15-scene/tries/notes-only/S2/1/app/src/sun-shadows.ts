import {
    addToScene,
    createPcfDirectionalShadowGenerator,
    rebuildSceneRenderables,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

const SUN_SHADOW_MAP_SIZE = 2048;

/**
 * Puts the sun in the scene (once) and gives it a PCF shadow map of
 * 2048 x 2048 texels made for that sun. The caller is responsible for
 * registering the scene with shadow support (registerSceneWithShadowSupport)
 * and for calling setShadowTaskCasterMeshes on the returned generator.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    const shadowGenerator = createPcfDirectionalShadowGenerator(engine, sun, { mapSize: SUN_SHADOW_MAP_SIZE });
    sun.shadowGenerator = shadowGenerator;

    // A light wired up after the scene was built needs its renderables rebuilt
    // so the shadow pass picks up the new generator.
    rebuildSceneRenderables(scene);

    return shadowGenerator;
}
