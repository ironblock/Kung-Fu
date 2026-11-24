import {
    addToScene,
    createPcfDirectionalShadowGenerator,
    rebuildSceneRenderables,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

const SUN_SHADOW_MAP_SIZE = 2048;

/**
 * Gives the sun a PCF shadow map and puts the sun in the scene (only once).
 * Casters and receivers are configured by the caller.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    const shadowGenerator = createPcfDirectionalShadowGenerator(engine, sun, { mapSize: SUN_SHADOW_MAP_SIZE });

    // The generator only renders once its light is assigned and present in scene.lights.
    sun.shadowGenerator = shadowGenerator;
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    // Assigning shadowGenerator does not re-run material builders that already ran,
    // so an already-built scene needs a rebuild to pick up the shadow. An unbuilt scene
    // gets it from its normal build.
    if (scene._built) {
        void rebuildSceneRenderables(scene);
    }

    return shadowGenerator;
}
