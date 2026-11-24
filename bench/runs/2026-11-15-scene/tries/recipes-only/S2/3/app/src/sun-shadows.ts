import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";
import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";

const SUN_SHADOW_MAP_SIZE = 2048;

/**
 * Puts the sun into the scene (once), gives it a PCF shadow map of
 * 2048 x 2048 texels, links that map to the sun and returns the generator.
 *
 * The caller is responsible for setting the casters (setShadowTaskCasterMeshes),
 * marking receivers (receiveShadows), and starting the scene with
 * registerSceneWithShadowSupport rather than registerScene; without the latter
 * no shadow pass runs.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    // Unverified: the 2048 size is passed as `mapSize`; check the option name against the 1.39.0 typings.
    const sg = createPcfDirectionalShadowGenerator(engine, sun, { mapSize: SUN_SHADOW_MAP_SIZE });

    sun.shadowGenerator = sg;
    return sg;
}
