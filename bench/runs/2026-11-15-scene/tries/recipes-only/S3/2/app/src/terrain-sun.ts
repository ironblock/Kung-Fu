import {
  addToScene,
  createDirectionalLight,
  createPcfDirectionalShadowGenerator,
  setLightIntensity,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

/** Valley terrain is a square centred on the origin in x and z. */
const VALLEY_HALF_SIZE = 1000;
/** Everything on the valley lies between height 0 and this. */
const VALLEY_MAX_HEIGHT = 400;

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;
/** Extra distance so no valley point sits near the light's near plane. */
const DEPTH_MARGIN = 10;

export function createValleySun(
  engine: EngineContext,
  scene: SceneContext,
  direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
  const [dx, dy, dz] = direction;
  const len = Math.hypot(dx, dy, dz);
  if (!(len > 0) || !(dy < 0)) {
    throw new Error("createValleySun: direction must be non-zero and point downwards (y < 0)");
  }
  const ux = dx / len;
  const uy = dy / len;
  const uz = dz / len;

  // Light-space depth of a valley point P is P·u + distance, where the light sits at -u * distance.
  // The farthest valley point "behind" the light, measured along u, is at P·u = -reach.
  // Placing the light at least reach + margin back keeps every valley point in front of the near plane.
  const reach =
    VALLEY_HALF_SIZE * (Math.abs(ux) + Math.abs(uz)) + VALLEY_MAX_HEIGHT * Math.abs(uy);
  const distance = reach + DEPTH_MARGIN;

  const sun = createDirectionalLight([ux, uy, uz]);
  sun.position.set(-ux * distance, -uy * distance, -uz * distance);
  setLightIntensity(sun, SUN_INTENSITY);
  addToScene(scene, sun);

  const shadows = createPcfDirectionalShadowGenerator(engine, sun, { mapSize: SHADOW_MAP_SIZE });
  sun.shadowGenerator = shadows;

  return { sun, shadows };
}
