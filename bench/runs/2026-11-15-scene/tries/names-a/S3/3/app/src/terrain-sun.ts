import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Valley: 2000 x 2000 units, centred on the origin in x and z, heights 0..400.
const VALLEY_HALF_SIZE = 1000;
const VALLEY_MIN_Y = 0;
const VALLEY_MAX_Y = 400;

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;

// Bounding sphere of the valley box. Its centre is (0, 200, 0) and its radius is
// the half-diagonal of the box, so every point in the valley is within RADIUS of
// the centre, whatever the light direction is.
const CENTER_Y = (VALLEY_MIN_Y + VALLEY_MAX_Y) / 2;
const RADIUS = Math.hypot(VALLEY_HALF_SIZE, (VALLEY_MAX_Y - VALLEY_MIN_Y) / 2, VALLEY_HALF_SIZE);
const MARGIN = 1;

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

    const sun = createDirectionalLight([ux, uy, uz], SUN_INTENSITY);

    // The shadow camera looks along the light direction from `position`. Put the
    // position one sphere-radius (plus margin) upstream of the valley centre, so
    // the whole bounding sphere lies in depth [0, 2 * d] from the light.
    const d = RADIUS + MARGIN;
    sun.position.set(
        0 - ux * d,
        CENTER_Y - uy * d,
        0 - uz * d,
    );

    addToScene(scene, sun);

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: 0,
        orthoMaxZ: 2 * d,
    });
    sun.shadowGenerator = shadows;
    addToScene(scene, shadows);

    return { sun, shadows };
}
