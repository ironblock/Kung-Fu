import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    const shadows = createPcfDirectionalShadowGenerator(engine, sun, { mapSize: 2048 });
    // The shadow pass finds generators through each scene light's `shadowGenerator`.
    sun.shadowGenerator = shadows;
    addToScene(scene, sun);
    return shadows;
}
