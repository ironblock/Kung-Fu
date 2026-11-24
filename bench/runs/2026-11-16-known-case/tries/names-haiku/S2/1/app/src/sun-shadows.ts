import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

const SUN_SHADOW_MAP_SIZE = 2048;

export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
  // Put the sun in the scene only once.
  if (!scene.lights.includes(sun)) {
    addToScene(scene, sun);
  }

  // Reuse an existing PCF generator for this sun rather than creating a second one.
  const existing = sun.shadowGenerator;
  if (existing && existing._shadowType === "pcf") {
    return existing;
  }

  const generator = createPcfDirectionalShadowGenerator(engine, sun, {
    mapSize: SUN_SHADOW_MAP_SIZE,
    // The shadow pass must re-render this map every time it renders shadows.
    forceRefreshEveryFrame: true,
  });

  sun.shadowGenerator = generator;
  if (!scene.shadowGenerators.includes(generator)) {
    addToScene(scene, generator);
  }

  return generator;
}
