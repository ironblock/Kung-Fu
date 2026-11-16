import {
  addToScene,
  createDirectionalLight,
  createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type {
  DirectionalLight,
  EngineContext,
  SceneContext,
  ShadowGenerator,
} from "@babylonjs/lite";

// Valley footprint in world units: 2000 x 2000 centred on the origin in x/z, heights 0..400.
const HALF_XZ = 1000;
const MIN_Y = 0;
const MAX_Y = 400;
const CENTER_Y = (MIN_Y + MAX_Y) / 2;
const HALF_Y = (MAX_Y - MIN_Y) / 2;
const MARGIN = 10;

export function createValleySun(
  engine: EngineContext,
  scene: SceneContext,
  direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
  const [dx, dy, dz] = direction;
  const len = Math.hypot(dx, dy, dz);
  if (!(len > 0)) {
    throw new Error("createValleySun: direction must be non-zero");
  }
  const ux = dx / len;
  const uy = dy / len;
  const uz = dz / len;
  if (!(uy < 0)) {
    throw new Error("createValleySun: direction must point downwards (y < 0)");
  }

  const sun = createDirectionalLight([ux, uy, uz], 1.3);

  // Largest extent of the valley box measured along the light direction,
  // from the box centre (0, CENTER_Y, 0).
  const reach =
    Math.abs(ux) * HALF_XZ + Math.abs(uy) * HALF_Y + Math.abs(uz) * HALF_XZ;

  // Put the light behind the valley on its own axis so that every point in
  // the valley has a positive depth. A point p then has depth
  // dot(p - C, d) + back, which lies in [MARGIN, 2 * reach + MARGIN].
  const back = reach + MARGIN;
  sun.position.set(-ux * back, CENTER_Y - uy * back, -uz * back);

  addToScene(scene, sun);

  const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
    mapSize: 2048,
    orthoMinZ: 1,
    orthoMaxZ: 2 * reach + 2 * MARGIN,
  });
  sun.shadowGenerator = shadows;
  if (!scene.shadowGenerators.includes(shadows)) {
    scene.shadowGenerators.push(shadows);
  }

  return { sun, shadows };
}
