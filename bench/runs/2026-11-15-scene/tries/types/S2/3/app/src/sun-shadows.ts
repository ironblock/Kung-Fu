import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

const SUN_SHADOW_MAP_SIZE = 2048;

/**
 * Puts the sun into the scene (once) and gives it a PCF directional shadow map.
 *
 * The map is regenerated every frame, so the shadow pass renders it each time it runs.
 * Casters and receivers are configured by the caller on the returned generator.
 *
 * Calling this again for the same sun returns the generator created the first time.
 */
export function addSunShadows(
  engine: EngineContext,
  scene: SceneContext,
  sun: DirectionalLight,
): ShadowGenerator {
  if (!scene.lights.includes(sun)) {
    addToScene(scene, sun);
  }

  let generator = sun.shadowGenerator;
  if (generator === undefined) {
    generator = createPcfDirectionalShadowGenerator(engine, sun, {
      mapSize: SUN_SHADOW_MAP_SIZE,
      forceRefreshEveryFrame: true,
    });
    sun.shadowGenerator = generator;
  } else if (generator._shadowType !== "pcf") {
    throw new Error("addSunShadows: this sun already has a non-PCF shadow generator");
  }

  if (!scene.shadowGenerators.includes(generator)) {
    addToScene(scene, generator);
  }

  return generator;
}
