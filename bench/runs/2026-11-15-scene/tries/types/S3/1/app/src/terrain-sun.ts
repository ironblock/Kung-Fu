import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

/** The valley terrain is a square centred on the origin in x and z. */
const VALLEY_HALF_SIZE = 1000; // 2000-unit square => half-extent 1000 in x and z
/** Everything on the valley lies between these heights. */
const VALLEY_MIN_Y = 0;
const VALLEY_MAX_Y = 400;

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;
/** Extra distance (world units) kept between the valley's bounding sphere and the light. */
const DEPTH_MARGIN = 10;

/**
 * Creates the valley's sun: a directional light with a PCF shadow map.
 *
 * The shadow projection is an orthographic box fitted to the casters' world bounds, and its
 * depth range is measured from the light's position. The light is therefore placed upstream of
 * the whole valley, and the depth range is set to span the valley's bounding sphere along the
 * light direction, so every point of the valley at heights 0..400 has positive depth inside
 * the map, whatever the direction.
 *
 * @param engine - Engine that owns the GPU device.
 * @param scene - Scene the sun and its shadow generator are added to.
 * @param direction - Direction the light travels in. Any length; must point downwards (y < 0).
 */
export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [dx, dy, dz] = direction;
    const length = Math.hypot(dx, dy, dz);
    if (!Number.isFinite(length) || length === 0) {
        throw new Error("createValleySun: direction must be a non-zero vector");
    }
    const ux = dx / length;
    const uy = dy / length;
    const uz = dz / length;
    if (!(uy < 0)) {
        throw new Error("createValleySun: direction must point downwards (y < 0)");
    }

    const sun = createDirectionalLight([ux, uy, uz], SUN_INTENSITY);

    // Bounding sphere of the valley box. Its centre is the middle of the box.
    const centerY = (VALLEY_MIN_Y + VALLEY_MAX_Y) / 2;
    const halfHeight = (VALLEY_MAX_Y - VALLEY_MIN_Y) / 2;
    const radius = Math.hypot(VALLEY_HALF_SIZE, halfHeight, VALLEY_HALF_SIZE);

    // Put the light `radius + margin` upstream of the centre, so every valley point is
    // between `margin` and `2 * radius + margin` along the light direction.
    const back = radius + DEPTH_MARGIN;
    sun.position.set(-ux * back, centerY - uy * back, -uz * back);

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: 1,
        orthoMaxZ: 2 * radius + 2 * DEPTH_MARGIN,
    });
    sun.shadowGenerator = shadows;

    addToScene(scene, sun);
    addToScene(scene, shadows);

    return { sun, shadows };
}
