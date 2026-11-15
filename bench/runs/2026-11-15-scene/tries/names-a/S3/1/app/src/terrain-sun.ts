import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Valley terrain: a 2000 x 2000 square in x/z centred on the origin, with
// everything lying between heights 0 and 400.
const HALF_EXTENT_XZ = 1000;
const MIN_Y = 0;
const MAX_Y = 400;
const CENTER_X = 0;
const CENTER_Y = (MIN_Y + MAX_Y) / 2;
const CENTER_Z = 0;

// Radius of the sphere that encloses the whole valley box. Any point in the
// valley is within this distance of the centre, so its projection onto any
// light direction lies within +/- BOUND_RADIUS of the centre's projection.
const BOUND_RADIUS = Math.sqrt(
    HALF_EXTENT_XZ * HALF_EXTENT_XZ +
        HALF_EXTENT_XZ * HALF_EXTENT_XZ +
        ((MAX_Y - MIN_Y) / 2) ** 2,
);
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
    if (!(dy < 0)) {
        throw new Error("createValleySun: direction must point downwards (dy < 0)");
    }
    const ux = dx / len;
    const uy = dy / len;
    const uz = dz / len;

    const sun = createDirectionalLight([dx, dy, dz], 1.3);

    // Park the light behind the valley, on the far side from where it shines,
    // so that the whole valley lies in front of it. The light sits `back`
    // units away from the valley centre, against the light direction.
    const back = BOUND_RADIUS + MARGIN;
    sun.position.set(
        CENTER_X - ux * back,
        CENTER_Y - uy * back,
        CENTER_Z - uz * back,
    );

    // Along the light direction, every valley point is at a depth of
    // back +/- BOUND_RADIUS from the light, i.e. within [MARGIN, 2 * BOUND_RADIUS + MARGIN].
    // Use a range that is a little wider than that on both ends.
    const orthoMinZ = 1;
    const orthoMaxZ = 2 * BOUND_RADIUS + 2 * MARGIN;

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: 2048,
        orthoMinZ,
        orthoMaxZ,
    });

    addToScene(scene, sun);
    addToScene(scene, shadows);

    return { sun, shadows };
}
