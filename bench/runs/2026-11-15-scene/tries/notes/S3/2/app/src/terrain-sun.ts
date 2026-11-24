import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Valley extent: x and z in [-1000, 1000], y in [0, 400], centred on the origin in x and z.
const HALF_EXTENT_X = 1000;
const HALF_EXTENT_Y = 200;
const HALF_EXTENT_Z = 1000;
const CENTER_Y = 200;

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;

// Slack, in world units, between the valley and the near/far depth limits.
const DEPTH_MARGIN = 10;
const ORTHO_MIN_Z = 1;

export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [rawX, rawY, rawZ] = direction;
    const length = Math.hypot(rawX, rawY, rawZ);
    if (!(length > 0)) {
        throw new Error("createValleySun: direction must be non-zero");
    }
    const dx = rawX / length;
    const dy = rawY / length;
    const dz = rawZ / length;

    // Largest distance of any point of the valley box from its centre, measured along the
    // light direction. For an axis-aligned box this is the sum of |d_i| * half_i.
    const radius =
        HALF_EXTENT_X * Math.abs(dx) + HALF_EXTENT_Y * Math.abs(dy) + HALF_EXTENT_Z * Math.abs(dz);

    // The shadow generator only keeps casters whose depth along the direction, measured from
    // the light's position, lies in [orthoMinZ, orthoMaxZ]. Put the light behind the valley
    // (on the side it comes from) so every valley point lies at depth in
    // [DEPTH_MARGIN, 2 * radius + DEPTH_MARGIN] from it.
    const lightDistance = radius + DEPTH_MARGIN;

    const sun = createDirectionalLight([dx, dy, dz], SUN_INTENSITY);
    sun.position.x = -dx * lightDistance;
    sun.position.y = CENTER_Y - dy * lightDistance;
    sun.position.z = -dz * lightDistance;

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: ORTHO_MIN_Z,
        orthoMaxZ: 2 * radius + 2 * DEPTH_MARGIN,
    });

    sun.shadowGenerator = shadows;
    addToScene(scene, sun);

    return { sun, shadows };
}
