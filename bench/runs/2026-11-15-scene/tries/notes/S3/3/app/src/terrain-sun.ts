import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Valley bounds: 2000 x 2000 square centred on the origin in x and z, heights 0..400.
const VALLEY_HALF_XZ = 1000;
const VALLEY_MIN_Y = 0;
const VALLEY_MAX_Y = 400;

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;
// Distance kept between the light's position and the nearest valley point, along the light direction.
const DEPTH_MARGIN = 10;

export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [x0, y0, z0] = direction;
    const length = Math.hypot(x0, y0, z0);
    if (!(length > 0)) {
        throw new Error("createValleySun: direction must be non-zero");
    }
    const dx = x0 / length;
    const dy = y0 / length;
    const dz = z0 / length;
    if (!(dy < 0)) {
        throw new Error("createValleySun: direction must point downwards");
    }

    // Centre and half-extents of the valley box.
    const cy = (VALLEY_MIN_Y + VALLEY_MAX_Y) / 2;
    const hy = (VALLEY_MAX_Y - VALLEY_MIN_Y) / 2;

    // Largest distance of any valley point from the box centre, measured along the light direction.
    const reach = VALLEY_HALF_XZ * Math.abs(dx) + hy * Math.abs(dy) + VALLEY_HALF_XZ * Math.abs(dz);

    // The shadow map's depth range is measured from the light's position along its direction.
    // Place the light upstream of the whole valley so every valley point lies at a depth in
    // [DEPTH_MARGIN, 2 * reach + DEPTH_MARGIN].
    const px = -dx * (reach + DEPTH_MARGIN);
    const py = cy - dy * (reach + DEPTH_MARGIN);
    const pz = -dz * (reach + DEPTH_MARGIN);

    const sun = createDirectionalLight([dx, dy, dz], SUN_INTENSITY);
    sun.position.set(px, py, pz);

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: 1,
        orthoMaxZ: 2 * reach + 2 * DEPTH_MARGIN,
    });
    sun.shadowGenerator = shadows;

    addToScene(scene, sun);

    return { sun, shadows };
}
