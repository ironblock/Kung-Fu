import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";
import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";

/**
 * Puts the sun into the scene (only if it is not there already) and gives it a
 * PCF shadow map of 2048 texels square, made for that sun.
 *
 * The map is re-rendered on every frame the shadow pass runs (`forceRefreshEveryFrame`).
 * The scene must be registered with `registerSceneWithShadowSupport`, not plain
 * `registerScene`, so that the scene-owned shadow pass is installed.
 *
 * Casters and receivers are wired by the caller; this function does not set them.
 *
 * @returns The shadow generator attached to `sun`.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    const shadowGenerator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: 2048,
        forceRefreshEveryFrame: true,
    });
    sun.shadowGenerator = shadowGenerator;
    addToScene(scene, shadowGenerator);

    return shadowGenerator;
}
