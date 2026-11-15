import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";
import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";

export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    // Put the sun in the scene once.
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    // PCF shadow map, 2048 texels square, created for this sun. forceRefreshEveryFrame
    // makes the map re-render on every shadow pass, not only when its inputs change.
    const generator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: 2048,
        forceRefreshEveryFrame: true,
    });
    sun.shadowGenerator = generator;
    addToScene(scene, generator);

    return generator;
}
