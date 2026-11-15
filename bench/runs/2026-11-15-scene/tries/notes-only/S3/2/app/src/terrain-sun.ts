import { addToScene, createDirectionalLight, createShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Valley terrain: 2000 units square, centred on the origin in x and z.
// Everything on it lies between height 0 and 400.
const VALLEY_HALF_SIZE = 1000;
const VALLEY_MIN_Y = 0;
const VALLEY_MAX_Y = 400;

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;
// Slack, in world units, kept on both sides of the valley along the light direction.
const DEPTH_MARGIN = 10;

/**
 * Creates the valley sun and its PCF shadow generator, and adds the sun to the scene.
 *
 * Directional shadows only keep casters between orthoMinZ and orthoMaxZ, measured along
 * the light direction from the light's position. The light is therefore placed behind the
 * whole valley and the depth range is set to span the valley's full extent along the
 * direction, so every caster at any height from 0 to 400 falls inside the map's depth range.
 *
 * Assumption: `direction` must point downwards (negative y), as the spec states.
 */
export function createValleySun(
  engine: EngineContext,
  scene: SceneContext,
  direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
  const [dx, dy, dz] = direction;
  const length = Math.hypot(dx, dy, dz);
  if (!(length > 0) || !Number.isFinite(length)) {
    throw new Error("createValleySun: direction must be a non-zero finite vector");
  }
  if (!(dy < 0)) {
    throw new Error("createValleySun: direction must point downwards (dy < 0)");
  }
  const ux = dx / length;
  const uy = dy / length;
  const uz = dz / length;

  // Project the valley box (x, z in [-H, H], y in [0, 400]) onto the unit direction.
  // The projection of a box onto an axis is the sum of per-axis extremes.
  const horizontalReach = VALLEY_HALF_SIZE * (Math.abs(ux) + Math.abs(uz));
  const projMin = -horizontalReach + Math.min(VALLEY_MIN_Y * uy, VALLEY_MAX_Y * uy);
  const projMax = horizontalReach + Math.max(VALLEY_MIN_Y * uy, VALLEY_MAX_Y * uy);

  // Place the light so that its position projects to (projMin - DEPTH_MARGIN) along the
  // direction. Every valley point then lies at depth in [DEPTH_MARGIN, projMax - projMin + DEPTH_MARGIN].
  const start = projMin - DEPTH_MARGIN;
  const position: [number, number, number] = [ux * start, uy * start, uz * start];

  const sun = createDirectionalLight(engine, "valleySun", [ux, uy, uz]);
  sun.intensity = SUN_INTENSITY;
  sun.position = position;
  sun.orthoMinZ = 1;
  sun.orthoMaxZ = projMax - projMin + 2 * DEPTH_MARGIN;

  const shadows = createShadowGenerator(engine, { mapSize: SHADOW_MAP_SIZE, filter: "pcf" });
  sun.shadowGenerator = shadows;

  addToScene(scene, sun);

  return { sun, shadows };
}
