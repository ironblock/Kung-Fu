import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";
import { addToScene, createShadowGenerator } from "@babylonjs/lite";

// Puts the sun in the scene (once), gives it a 2048x2048 PCF shadow map and
// attaches that map to the sun so the scene's shadow pass renders it.
// Casters and receivers are set by the caller, on the returned generator.
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
    // addToScene does not check membership (notes 21), so check first.
    if (!scene.lights.includes(sun)) {
        addToScene(scene, sun);
    }

    // NOTE: createShadowGenerator and its options ({ mapSize, filter }) are
    // assumed names; the notes do not give the factory, and the library is not
    // available here to confirm them.
    const generator = createShadowGenerator(engine, sun, { mapSize: 2048, filter: "pcf" });

    // The shadow pass finds generators only through light.shadowGenerator (notes 3).
    sun.shadowGenerator = generator;
    return generator;
}
