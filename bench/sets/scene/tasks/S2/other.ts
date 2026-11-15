import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Another right answer: add the light first, then hang the generator on it.
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }
    const generator = createPcfDirectionalShadowGenerator(engine, sun, { mapSize: 2048, darkness: 0 });
    scene.lights[scene.lights.indexOf(sun)]!.shadowGenerator = generator;
    return generator;
}
