import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

/** Width and height, in texels, of the sun's square shadow map. */
const SUN_SHADOW_MAP_SIZE = 2048;

/**
 * Puts `sun` in `scene` (only if it is not already there) and gives it a PCF shadow map,
 * 2048 texels square, that is redrawn on every shadow pass.
 *
 * The caller decides which meshes cast shadows and which receive them.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    const shadowGenerator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SUN_SHADOW_MAP_SIZE,
        // Without this the PCF pass keeps reusing the old map until a caster or the light changes.
        forceRefreshEveryFrame: true,
    });
    addToScene(scene, shadowGenerator);

    return shadowGenerator;
}
