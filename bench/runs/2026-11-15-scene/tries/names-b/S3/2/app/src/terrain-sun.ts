import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Valley bounds: 2000 units square in x and z, centred on the origin;
// everything on it lies between y = 0 and y = 400.
const HALF_WIDTH = 1000;
const MIN_Y = 0;
const MAX_Y = 400;
const CENTER: [number, number, number] = [0, (MIN_Y + MAX_Y) / 2, 0];
// Radius of the sphere around CENTER that contains the whole valley box.
const BOUNDING_RADIUS = Math.hypot(HALF_WIDTH, (MAX_Y - MIN_Y) / 2, HALF_WIDTH);

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;
// Extra distance added on each side of the depth range so nothing sits on the edge.
const DEPTH_MARGIN = 100;

export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [dx, dy, dz] = direction;
    const length = Math.hypot(dx, dy, dz);
    if (!(length > 0) || !Number.isFinite(length)) {
        throw new Error("createValleySun: direction must be a non-zero vector");
    }
    const ux = dx / length;
    const uy = dy / length;
    const uz = dz / length;
    if (uy >= 0) {
        throw new Error("createValleySun: direction must point downwards (negative y)");
    }

    const sun = createDirectionalLight([ux, uy, uz], SUN_INTENSITY);

    // Place the light far enough back along -direction that the whole valley
    // lies in front of it: every valley point has a depth along the light
    // direction within BOUNDING_RADIUS of CENTER's depth, so with this standoff
    // the depth range is [DEPTH_MARGIN, 2 * BOUNDING_RADIUS + DEPTH_MARGIN].
    const standoff = BOUNDING_RADIUS + DEPTH_MARGIN;
    sun.position.set(
        CENTER[0] - ux * standoff,
        CENTER[1] - uy * standoff,
        CENTER[2] - uz * standoff,
    );
    addToScene(scene, sun);

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: 1,
        orthoMaxZ: standoff + BOUNDING_RADIUS + DEPTH_MARGIN,
    });
    sun.shadowGenerator = shadows;
    addToScene(scene, shadows);

    return { sun, shadows };
}
