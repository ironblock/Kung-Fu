import {
  addToScene,
  createPcfDirectionalShadowGenerator,
  setShadowGeneratorEnabled,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// One generator per sun, so calling addSunShadows twice does not create a second shadow map.
const generatorBySun = new WeakMap<DirectionalLight, ShadowGenerator>();

export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator {
  // Put the sun in the scene, once.
  if (!scene.lights.includes(sun)) {
    addToScene(scene, sun);
  }

  let sg = generatorBySun.get(sun);
  if (!sg) {
    sg = createPcfDirectionalShadowGenerator(engine, sun, {
      mapSize: 2048,
      // Re-render the shadow map on every shadow pass, so moving casters are never shown stale.
      forceRefreshEveryFrame: true,
    });
    generatorBySun.set(sun, sg);
  }

  // Make sure the shadow pass includes this generator, and that it is enabled.
  if (!scene.shadowGenerators.includes(sg)) {
    addToScene(scene, sg);
  }
  setShadowGeneratorEnabled(sg, true);

  sun.shadowGenerator = sg;
  return sg;
}
