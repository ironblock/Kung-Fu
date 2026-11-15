import { addToScene, createDirectionalLight, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// The valley: a 2000 x 2000 square centred on the origin in x/z, with everything on it between heights 0 and 400.
const VALLEY_HALF_X = 1000;
const VALLEY_HALF_Z = 1000;
const VALLEY_MIN_Y = 0;
const VALLEY_MAX_Y = 400;

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;

/** Near plane of the shadow projection, measured from the sun along its direction. */
const SHADOW_NEAR = 1;
/** Slack kept between the valley and each of the near and far planes. */
const SHADOW_MARGIN = 50;

/**
 * Creates the valley's sun with a PCF shadow map that covers the whole valley.
 *
 * The shadow generator fits the map's width and height to the casters. Its depth range
 * (orthoMinZ..orthoMaxZ) is measured from the light's position along the light's direction,
 * so a sun left near the origin would clip anything above or behind it. The sun is therefore
 * placed up-sun, outside the valley, and the depth range is set to enclose the whole valley box.
 */
export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [dx, dy, dz] = direction;
    const length = Math.hypot(dx, dy, dz);
    if (!Number.isFinite(length) || length === 0) {
        throw new RangeError(`createValleySun: direction must be a finite, non-zero vector, got [${direction.join(", ")}]`);
    }
    const nx = dx / length;
    const ny = dy / length;
    const nz = dz / length;

    // Centre and vertical half-height of the valley box.
    const cx = 0;
    const cy = (VALLEY_MIN_Y + VALLEY_MAX_Y) / 2;
    const cz = 0;
    const halfY = (VALLEY_MAX_Y - VALLEY_MIN_Y) / 2;

    // Seen along the sun direction, the box extends this far either side of its centre.
    const halfDepth = VALLEY_HALF_X * Math.abs(nx) + halfY * Math.abs(ny) + VALLEY_HALF_Z * Math.abs(nz);

    // Back the sun off from the valley centre far enough that the whole box lies in
    // [SHADOW_NEAR + SHADOW_MARGIN, SHADOW_NEAR + SHADOW_MARGIN + 2 * halfDepth] in front of it.
    const distance = SHADOW_NEAR + SHADOW_MARGIN + halfDepth;

    const sun = createDirectionalLight([nx, ny, nz], SUN_INTENSITY);
    sun.position.set(cx - nx * distance, cy - ny * distance, cz - nz * distance);
    addToScene(scene, sun);

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: SHADOW_NEAR,
        orthoMaxZ: distance + halfDepth + SHADOW_MARGIN,
    });
    addToScene(scene, shadows);

    return { sun, shadows };
}
