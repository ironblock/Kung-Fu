import {
    addToScene,
    createPcfDirectionalShadowGenerator,
    type DirectionalLight,
    type EngineContext,
    type SceneContext,
    type ShadowGenerator,
} from "@babylonjs/lite";

/**
 * Puts the sun into the scene (once) and gives it a PCF shadow map of 2048 texels
 * square. The map is re-rendered every frame so the shadow pass always draws it.
 * Callers choose the casters and receivers on the returned generator.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    const generator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: 2048,
        forceRefreshEveryFrame: true,
    });

    sun.shadowGenerator = generator;
    if (!scene.shadowGenerators.includes(generator)) {
        addToScene(scene, generator);
    }

    return generator;
}
