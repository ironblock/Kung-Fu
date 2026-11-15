import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";
import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";

/**
 * Puts the sun into the scene (once) and gives it a PCF shadow map of 2048 texels.
 * The map is redrawn every frame the shadow pass renders, so caster and receiver
 * changes made by other code are always picked up.
 *
 * Casters and receivers are set by the caller, so they are not handled here.
 * The scene must be registered with shadow support (registerSceneWithShadowSupport)
 * for the shadow pass to draw this map.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
  if (!scene.lights.includes(sun)) {
    addToScene(scene, sun);
  }

  const shadowGenerator = createPcfDirectionalShadowGenerator(engine, sun, {
    mapSize: 2048,
    forceRefreshEveryFrame: true,
  });

  // Creating the generator does not link it; the sun has to point at it for its map to be drawn and sampled.
  sun.shadowGenerator = shadowGenerator;

  return shadowGenerator;
}
