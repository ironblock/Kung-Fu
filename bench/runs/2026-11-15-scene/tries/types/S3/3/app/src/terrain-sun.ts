import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

/** Valley terrain is 2000 units square in x/z, centred on the origin. */
const VALLEY_HALF_XZ = 1000;
/** Everything on the valley lies between these heights. */
const VALLEY_MAX_Y = 400;
/**
 * Length of the valley's bounding-box diagonal. No point in the valley can be further
 * apart than this along any direction, so the shadow depth range must span at least this.
 */
const VALLEY_DIAGONAL = Math.hypot(2 * VALLEY_HALF_XZ, VALLEY_MAX_Y, 2 * VALLEY_HALF_XZ);

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;
/** Ortho depth range: covers the valley diagonal (~2857) with a wide margin in any light direction. */
const ORTHO_MIN_Z = 1;
const ORTHO_MAX_Z = 10000;

/**
 * Creates the valley's sun: a directional light along `direction` (any length, must point
 * downwards) with a 2048-texel PCF shadow map, added to `scene`.
 *
 * The shadow map's projection is fit to the casters registered with the generator. Its depth
 * range is fixed at `[ORTHO_MIN_Z, ORTHO_MAX_Z]`, which must contain every caster in the valley.
 */
export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [dx, dy, dz] = direction;
    const length = Math.hypot(dx, dy, dz);
    if (!Number.isFinite(length) || length === 0) {
        throw new Error("createValleySun: direction must be a finite, non-zero vector");
    }
    if (!(dy < 0)) {
        throw new Error("createValleySun: direction must point downwards (negative y)");
    }
    const unit: [number, number, number] = [dx / length, dy / length, dz / length];

    if (ORTHO_MAX_Z - ORTHO_MIN_Z < VALLEY_DIAGONAL) {
        throw new Error("createValleySun: shadow depth range is smaller than the valley");
    }

    const sun = createDirectionalLight(unit, SUN_INTENSITY);
    addToScene(scene, sun);

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: ORTHO_MIN_Z,
        orthoMaxZ: ORTHO_MAX_Z,
    });
    sun.shadowGenerator = shadows;
    addToScene(scene, shadows);

    return { sun, shadows };
}
