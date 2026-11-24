import {
  addToScene,
  createDirectionalLight,
  createPcfDirectionalShadowGenerator,
  setLightIntensity,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

type Vec3 = [number, number, number];

// Valley bounds: 2000 x 2000 centred on the origin in x and z, everything between y = 0 and y = 400.
const VALLEY_CENTER: Vec3 = [0, 200, 0];
const VALLEY_HALF_SIZE: Vec3 = [1000, 200, 1000];

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;
// Extra distance added on each side of the valley box along the light direction, so no caster sits on the frustum edge.
const SHADOW_MARGIN = 1;

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function normalize(a: Vec3): Vec3 {
  const len = Math.hypot(a[0], a[1], a[2]);
  if (len === 0) {
    throw new Error("terrain-sun: zero-length vector");
  }
  return [a[0] / len, a[1] / len, a[2] / len];
}

// Half-extent of the valley box projected onto a unit vector u.
// Exact for an axis-aligned box: sum of |u_i| * half_i.
function valleyHalfExtent(u: Vec3): number {
  return (
    VALLEY_HALF_SIZE[0] * Math.abs(u[0]) +
    VALLEY_HALF_SIZE[1] * Math.abs(u[1]) +
    VALLEY_HALF_SIZE[2] * Math.abs(u[2])
  );
}

/**
 * Sets the light's position and orthographic shadow frustum so that every point of the
 * valley box lies inside the shadow map, for any light direction.
 *
 * The light sits on the line through the valley centre, backed off far enough that the whole
 * box is in front of it. The frustum is then symmetric about that line, with half-width equal to
 * the box's projected extent on each of the two perpendicular axes, and depth covering the box's
 * projected extent along the light direction.
 */
function fitShadowFrustum(sun: DirectionalLight, d: Vec3): void {
  // Orthonormal basis (r, u, d) with d the light direction.
  const ref: Vec3 = Math.abs(d[0]) < 0.9 ? [1, 0, 0] : [0, 0, 1];
  const r = normalize(cross(d, ref));
  const u = cross(r, d);

  const extentR = valleyHalfExtent(r);
  const extentU = valleyHalfExtent(u);
  const extentD = valleyHalfExtent(d);

  // Back the light off along -d so the near end of the box is SHADOW_MARGIN in front of it.
  const backOff = extentD + SHADOW_MARGIN;
  const position: Vec3 = [
    VALLEY_CENTER[0] - d[0] * backOff,
    VALLEY_CENTER[1] - d[1] * backOff,
    VALLEY_CENTER[2] - d[2] * backOff,
  ];

  sun.position = position;
  sun.autoUpdateExtends = false;
  sun.orthoLeft = -extentR;
  sun.orthoRight = extentR;
  sun.orthoBottom = -extentU;
  sun.orthoTop = extentU;
  sun.shadowMinZ = SHADOW_MARGIN;
  sun.shadowMaxZ = 2 * extentD + SHADOW_MARGIN;
}

export function createValleySun(
  engine: EngineContext,
  scene: SceneContext,
  direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
  const d = normalize(direction);
  if (d[1] >= 0) {
    throw new Error("terrain-sun: sun direction must point downwards (negative y)");
  }

  const sun = createDirectionalLight(d);
  setLightIntensity(sun, SUN_INTENSITY);
  fitShadowFrustum(sun, d);
  addToScene(scene, sun);

  const shadows = createPcfDirectionalShadowGenerator(engine, sun, SHADOW_MAP_SIZE);
  sun.shadowGenerator = shadows;

  return { sun, shadows };
}
