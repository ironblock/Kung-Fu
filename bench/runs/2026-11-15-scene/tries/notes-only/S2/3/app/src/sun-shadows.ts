import {
    addToScene,
    createPcfDirectionalShadowGenerator,
    rebuildSceneRenderables,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

const SUN_SHADOW_MAP_SIZE = 2048;

// One generator per sun, so repeated calls neither duplicate the light nor the shadow map.
const generators = new WeakMap<DirectionalLight, ShadowGenerator>();

export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    const existing = generators.get(sun);
    if (existing) {
        return existing;
    }

    // Put the sun in the scene once. A light is only uploaded/used when it is in scene.lights.
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    // PCF directional shadow map, 2048 texels square, made for this sun.
    const shadowGenerator = createPcfDirectionalShadowGenerator(engine, sun, { mapSize: SUN_SHADOW_MAP_SIZE });

    // Link the generator to the sun so the scene's shadow pass renders its map.
    sun.shadowGenerator = shadowGenerator;

    // Assigning shadowGenerator after materials were already built does not re-run their builders.
    rebuildSceneRenderables(scene);

    generators.set(sun, shadowGenerator);
    return shadowGenerator;
}
