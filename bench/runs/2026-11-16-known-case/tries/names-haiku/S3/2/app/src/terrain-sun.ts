import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

const VALLEY_HALF_SIZE_XZ = 1000; // terrain spans [-1000, 1000] in x and z
const VALLEY_MAX_HEIGHT = 400;    // everything lies in [0, 400] in y
const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;

// Bounding sphere of the valley box [-1000, 1000] x [0, 400] x [-1000, 1000].
const VALLEY_CENTER_Y = VALLEY_MAX_HEIGHT / 2;
const VALLEY_RADIUS = Math.sqrt(
    2 * VALLEY_HALF_SIZE_XZ * VALLEY_HALF_SIZE_XZ + VALLEY_CENTER_Y * VALLEY_CENTER_Y,
);

export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [x, y, z] = direction;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
        throw new Error("createValleySun: direction must be finite");
    }
    const len = Math.hypot(x, y, z);
    if (!(len > 0)) {
        throw new Error("createValleySun: direction must not be zero");
    }
    if (!(y < 0)) {
        throw new Error("createValleySun: direction must point downwards (y < 0)");
    }
    const dir: [number, number, number] = [x / len, y / len, z / len];

    const sun = createDirectionalLight(dir, SUN_INTENSITY);
    addToScene(scene, sun);

    // The depth range must cover the whole valley along any light direction.
    // Measured from a point one radius behind the valley centre, every point of
    // the valley lies between depth 0 and depth 2 * VALLEY_RADIUS.
    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: 0,
        orthoMaxZ: 2 * VALLEY_RADIUS + 1,
    });
    addToScene(scene, shadows);

    return { sun, shadows };
}
