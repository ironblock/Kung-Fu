import {
    addToScene,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

const SUN_SHADOW_MAP_SIZE = 2048;

// One shadow generator per (scene, sun) pair, so repeated calls neither add the
// sun twice nor create a second shadow map for it.
const generatorsByScene = new WeakMap<SceneContext, WeakMap<DirectionalLight, ShadowGenerator>>();

export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    let generators = generatorsByScene.get(scene);
    if (!generators) {
        generators = new WeakMap<DirectionalLight, ShadowGenerator>();
        generatorsByScene.set(scene, generators);
    }

    const existing = generators.get(sun);
    if (existing) {
        return existing;
    }

    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    const generator = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SUN_SHADOW_MAP_SIZE,
        // Render the shadow map on every shadow pass, not only when the caster
        // version changes.
        forceRefreshEveryFrame: true,
    });
    addToScene(scene, generator);

    generators.set(sun, generator);
    return generator;
}
