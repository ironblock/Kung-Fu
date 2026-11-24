import { addToScene, createDirectionalLight, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Valley terrain: 2000 x 2000 units centred on the origin in x and z,
// everything lies between y = 0 and y = 400.
const VALLEY_HALF_XZ = 1000;
const VALLEY_MIN_Y = 0;
const VALLEY_MAX_Y = 400;
const VALLEY_CENTRE: readonly [number, number, number] = [0, (VALLEY_MIN_Y + VALLEY_MAX_Y) / 2, 0];
// Radius of the sphere around the centre that contains the whole valley box.
// The box corners are the farthest points, so this bounds the valley in every direction.
const VALLEY_RADIUS = Math.hypot(VALLEY_HALF_XZ, (VALLEY_MAX_Y - VALLEY_MIN_Y) / 2, VALLEY_HALF_XZ);

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;

export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [dx, dy, dz] = direction;
    const length = Math.hypot(dx, dy, dz);
    if (!(length > 0)) {
        throw new Error("createValleySun: direction must be a non-zero vector");
    }
    const ux = dx / length;
    const uy = dy / length;
    const uz = dz / length;

    const sun = createDirectionalLight([ux, uy, uz], SUN_INTENSITY);

    // Put the light's origin one valley radius behind the valley centre, measured
    // against the light direction. Every point of the valley then lies between
    // distance 0 and 2 * VALLEY_RADIUS in front of that origin, for any direction.
    sun.position.x = VALLEY_CENTRE[0] - ux * VALLEY_RADIUS;
    sun.position.y = VALLEY_CENTRE[1] - uy * VALLEY_RADIUS;
    sun.position.z = VALLEY_CENTRE[2] - uz * VALLEY_RADIUS;

    addToScene(scene, sun);

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: 0,
        orthoMaxZ: 2 * VALLEY_RADIUS,
    });
    sun.shadowGenerator = shadows;

    return { sun, shadows };
}
