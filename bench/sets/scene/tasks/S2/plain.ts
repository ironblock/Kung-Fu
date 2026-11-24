import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    const shadows = createPcfDirectionalShadowGenerator(engine, sun, { mapSize: 2048 });
    addToScene(scene, sun);
    // addToScene takes any SceneEntity, and a ShadowGenerator is one.
    addToScene(scene, shadows);
    return shadows;
}
