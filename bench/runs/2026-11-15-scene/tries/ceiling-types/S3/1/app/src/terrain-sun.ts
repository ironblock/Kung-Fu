import { addToScene, createDirectionalLight, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// The valley: a 2000 x 2000 square centred on the origin in x/z, with everything on it between y = 0 and y = 400.
const VALLEY_HALF_SIZE = 1000;
const VALLEY_MIN_Y = 0;
const VALLEY_MAX_Y = 400;

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;

/** World units of slack between the valley and the shadow volume's near and far planes. */
const DEPTH_MARGIN = 100;
/** Near plane of the shadow volume, measured from the sun's position along its direction. */
const SHADOW_NEAR = 1;

/**
 * Creates the valley's sun: a directional light shining along `direction` (any length) with a
 * 2048-texel PCF shadow map whose volume contains the whole valley, and adds it to `scene`.
 * Shadow casters are assigned to the returned generator elsewhere.
 */
export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [dx, dy, dz] = unitDirection(direction);
    const sun = createDirectionalLight([dx, dy, dz], SUN_INTENSITY);

    // The PCF directional generator fits the width and height of its orthographic shadow volume to the
    // casters, but not its depth: that runs from orthoMinZ to orthoMaxZ along the light direction, measured
    // from sun.position. A caster nearer than the near plane (level with or above the light) or beyond the
    // far plane is clipped out of the map and casts nothing. So the sun is placed up-light of the whole
    // valley box, and the depth range is sized to that box.
    //
    // Projected onto the (unit) light direction, the box spans centre·d ± halfDepth.
    const centreY = (VALLEY_MIN_Y + VALLEY_MAX_Y) / 2;
    const halfDepth =
        VALLEY_HALF_SIZE * Math.abs(dx) +
        ((VALLEY_MAX_Y - VALLEY_MIN_Y) / 2) * Math.abs(dy) +
        VALLEY_HALF_SIZE * Math.abs(dz);
    const standoff = halfDepth + DEPTH_MARGIN;
    sun.position.x = -dx * standoff;
    sun.position.y = centreY - dy * standoff;
    sun.position.z = -dz * standoff;
    // Seen from there, every point of the valley lies between DEPTH_MARGIN and 2·halfDepth + DEPTH_MARGIN
    // along the direction, which is inside [SHADOW_NEAR, 2·standoff] with DEPTH_MARGIN to spare at each end.

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: SHADOW_NEAR,
        orthoMaxZ: 2 * standoff,
    });
    sun.shadowGenerator = shadows;

    addToScene(scene, sun);
    // addToScene also takes shadow generators; register this one unless adding its light already did.
    if (!scene.shadowGenerators.includes(shadows)) {
        addToScene(scene, shadows);
    }

    return { sun, shadows };
}

/** Normalises the sun direction, so the light and the shadow-volume maths above agree whatever its length. */
function unitDirection([x, y, z]: [number, number, number]): [number, number, number] {
    const length = Math.hypot(x, y, z);
    if (!(length > 0) || !Number.isFinite(length)) {
        throw new Error(`createValleySun: direction must be a finite, non-zero vector (got [${x}, ${y}, ${z}])`);
    }
    // A sun pointing exactly straight down is parallel to the world up vector a light look-at is built
    // from; tilt it by a microradian so the shadow view matrix cannot degenerate.
    if (x === 0 && z === 0) {
        z = length * 1e-6;
    }
    const n = Math.hypot(x, y, z);
    return [x / n, y / n, z / n];
}
