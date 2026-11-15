import {
  addToScene,
  createDirectionalLight,
  createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;

// The PCF generator fits its orthographic light volume to the casters' world AABBs and uses
// [orthoMinZ, orthoMaxZ] as the light-space depth range. The valley is 2000 x 2000 x 400 units, so its
// corner-to-corner extent is sqrt(2000^2 + 2000^2 + 400^2) ~= 2863 units. A depth range of 10000 keeps
// every point of the valley inside the depth range with a wide margin for any light direction.
const SHADOW_ORTHO_MIN_Z = 1;
const SHADOW_ORTHO_MAX_Z = 10000;

/**
 * Creates the valley's sun: a directional light along `direction` with a PCF shadow map.
 * `direction` may have any length; it is normalised here. It must point downwards (y < 0).
 */
export function createValleySun(
  engine: EngineContext,
  scene: SceneContext,
  direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
  const [dx, dy, dz] = direction;
  const length = Math.hypot(dx, dy, dz);
  if (!Number.isFinite(length) || length === 0) {
    throw new Error("createValleySun: direction must be a non-zero, finite vector");
  }
  if (!(dy < 0)) {
    throw new Error("createValleySun: direction must point downwards (y < 0)");
  }
  const unitDirection: [number, number, number] = [dx / length, dy / length, dz / length];

  const sun = createDirectionalLight(unitDirection, SUN_INTENSITY);
  addToScene(scene, sun);

  const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
    mapSize: SHADOW_MAP_SIZE,
    orthoMinZ: SHADOW_ORTHO_MIN_Z,
    orthoMaxZ: SHADOW_ORTHO_MAX_Z,
  });
  sun.shadowGenerator = shadows;
  addToScene(scene, shadows);

  return { sun, shadows };
}
