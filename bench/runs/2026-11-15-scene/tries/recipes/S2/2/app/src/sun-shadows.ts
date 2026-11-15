import {
  addToScene,
  createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

/**
 * Adds the sun to the scene (once) and gives it a 2048² PCF shadow map.
 * Casters and receivers are configured by the caller.
 */
export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
  if (!scene.lights.includes(sun)) {
    addToScene(scene, sun);
  }

  const sg = createPcfDirectionalShadowGenerator(engine, sun, {
    mapSize: 2048,
    // Re-draw the map on every shadow pass, not only when something changed.
    forceRefreshEveryFrame: true,
  });
  // Creating the generator does not link it to the light; link it explicitly.
  sun.shadowGenerator = sg;

  return sg;
}
