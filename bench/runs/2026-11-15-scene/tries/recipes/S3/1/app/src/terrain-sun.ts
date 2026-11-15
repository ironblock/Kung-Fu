import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// The valley is a 2000 x 2000 square centred on the origin in x and z, and
// everything on it lies between height 0 and 400. Its bounding box is
// therefore centred on (0, 200, 0) with half-extents (1000, 200, 1000).
const VALLEY_CENTER: readonly [number, number, number] = [0, 200, 0];
const VALLEY_HALF_X = 1000;
const VALLEY_HALF_Y = 200;
const VALLEY_HALF_Z = 1000;

// Every point of the valley is within this distance of VALLEY_CENTER, whatever
// the light direction is. Using a sphere keeps the depth range valid for any
// direction, including oblique ones where the valley's extent along the light
// is larger than its width.
const VALLEY_RADIUS = Math.hypot(VALLEY_HALF_X, VALLEY_HALF_Y, VALLEY_HALF_Z);

// Small slack so points on the very edge are not clipped by rounding.
const SLACK = 1;

export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [dx, dy, dz] = direction;
    const length = Math.hypot(dx, dy, dz);
    if (!(length > 0)) {
        throw new Error("createValleySun: direction must be non-zero");
    }
    const ux = dx / length;
    const uy = dy / length;
    const uz = dz / length;
    if (!(uy < 0)) {
        throw new Error("createValleySun: direction must point downwards (negative y)");
    }

    const sun = createDirectionalLight([ux, uy, uz], 1.3);

    // Put the light's origin upstream of the valley, along the light direction,
    // so that the whole valley sits in front of it. With the origin at distance
    // VALLEY_RADIUS + SLACK from the centre, every valley point has a depth
    // along the light in [SLACK, 2 * VALLEY_RADIUS + SLACK].
    const back = VALLEY_RADIUS + SLACK;
    sun.position.x = VALLEY_CENTER[0] - ux * back;
    sun.position.y = VALLEY_CENTER[1] - uy * back;
    sun.position.z = VALLEY_CENTER[2] - uz * back;

    addToScene(scene, sun);

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: 2048,
        orthoMinZ: 0,
        orthoMaxZ: 2 * VALLEY_RADIUS + 2 * SLACK,
    });
    sun.shadowGenerator = shadows;

    return { sun, shadows };
}
