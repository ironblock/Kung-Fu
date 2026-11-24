import { addToScene, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

const SUN_SHADOW_MAP_SIZE = 2048;

/**
 * Puts the sun into the scene (only once), gives it a PCF shadow map of
 * 2048 x 2048 texels, and links that map to the sun so the shadow pass draws it.
 *
 * Caster meshes and receivers are the caller's job: call
 * setShadowTaskCasterMeshes(sg, casters) on the returned generator, and set
 * receiveShadows on the meshes that should show shadows, before the scene is
 * registered with registerSceneWithShadowSupport.
 */
export function addSunShadows(
  engine: EngineContext,
  scene: SceneContext,
  sun: DirectionalLight,
): ShadowGenerator {
  if (!scene.lights.includes(sun)) {
    addToScene(scene, sun);
  }

  // The generator is made for this sun. Its map size is passed as an option;
  // the exact option name is not verified against the library (not on this machine).
  const sg = createPcfDirectionalShadowGenerator(engine, sun, { mapSize: SUN_SHADOW_MAP_SIZE });

  // Creating the generator does not link it; without this the shadow pass never draws the map.
  sun.shadowGenerator = sg;

  return sg;
}
