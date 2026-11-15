import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

const SUN_SHADOW_MAP_SIZE = 2048;

export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    const generator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SUN_SHADOW_MAP_SIZE,
        // Without this the PCF map is only redrawn when caster or light versions change;
        // we want it redrawn on every run of the shadow pass.
        forceRefreshEveryFrame: true,
    });

    // Creating a generator does not attach it, and addToScene(scene, generator) is a no-op:
    // the shadow task only finds generators through light.shadowGenerator.
    sun.shadowGenerator = generator;

    // addToScene does not check membership, so adding twice would list the sun twice.
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    return generator;
}
