import {
  addToScene,
  createDirectionalLight,
  createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// The valley is a box: x and z in [-1000, 1000], y in [0, 400].
const HALF_X = 1000;
const HALF_Y = 200;
const HALF_Z = 1000;
const CENTER_Y = 200;

// Minimum distance, along the light direction, between the light and the
// nearest point of the valley. Keeps every caster in front of the light's
// near plane (the PCF map starts 1 unit in front of the light position).
const CLEARANCE = 100;

export function createValleySun(
  engine: EngineContext,
  scene: SceneContext,
  direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
  const [dx, dy, dz] = direction;
  const len = Math.hypot(dx, dy, dz);
  if (!(len > 0) || !Number.isFinite(len)) {
    throw new Error("createValleySun: direction must be a non-zero vector");
  }
  const d: [number, number, number] = [dx / len, dy / len, dz / len];

  // Half-width of the valley box measured along the light direction.
  const support =
    Math.abs(d[0]) * HALF_X + Math.abs(d[1]) * HALF_Y + Math.abs(d[2]) * HALF_Z;

  // Put the light behind the valley centre, far enough that the whole valley
  // lies between CLEARANCE and 2 * support + CLEARANCE in front of it.
  const back = support + CLEARANCE;
  const sun = createDirectionalLight(d, 1.3);
  sun.position.set(-d[0] * back, CENTER_Y - d[1] * back, -d[2] * back);
  addToScene(scene, sun);

  const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
    mapSize: 2048,
    orthoMinZ: 1,
    orthoMaxZ: 2 * support + 2 * CLEARANCE,
  });
  sun.shadowGenerator = shadows;

  return { sun, shadows };
}
