import { addToScene, createDirectionalLight, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

/** The valley: a 2000-unit square centred on the origin in x/z, contents between heights 0 and 400. */
const VALLEY_CENTER: readonly [number, number, number] = [0, 200, 0];
const VALLEY_HALF_EXTENTS: readonly [number, number, number] = [1000, 200, 1000];

/** Depth (along the light) at which the PCF map starts, in front of the light's position. */
const SHADOW_NEAR = 1;
/** Extra depth kept free at both ends of the map, so nothing in the valley sits right on a clip plane. */
const DEPTH_MARGIN = 10;

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;

/**
 * Creates the valley sun: a directional light shining along `direction` (any length) with a
 * 2048-texel PCF shadow map, adds it to `scene` and links the generator to the light.
 * The caller still decides which meshes cast (setShadowTaskCasterMeshes) and registers the
 * scene with registerSceneWithShadowSupport.
 *
 * Coverage: the map is fitted sideways to the casters' bounds, but its depth range is fixed,
 * from SHADOW_NEAR in front of the light's position out to orthoMaxZ. So the light is placed
 * back along the ray through the valley's centre, far enough that the nearest point of the
 * valley box is SHADOW_NEAR + DEPTH_MARGIN in front of it. orthoMaxZ then reaches past the
 * farthest point by DEPTH_MARGIN. Every point of the box therefore has a depth inside the map
 * for this direction.
 */
export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [x, y, z] = direction;
    const length = Math.hypot(x, y, z);
    if (!Number.isFinite(length) || length === 0) {
        throw new Error(`createValleySun: direction must be a finite, non-zero vector, got [${direction.join(", ")}]`);
    }
    const d: [number, number, number] = [x / length, y / length, z / length];

    // Half the box's depth along d: how far the valley reaches in front of and behind its centre.
    const halfDepth =
        VALLEY_HALF_EXTENTS[0] * Math.abs(d[0]) +
        VALLEY_HALF_EXTENTS[1] * Math.abs(d[1]) +
        VALLEY_HALF_EXTENTS[2] * Math.abs(d[2]);

    // Put the centre at depth halfDepth + SHADOW_NEAR + DEPTH_MARGIN. Valley depths then run from
    // SHADOW_NEAR + DEPTH_MARGIN up to 2 * halfDepth + SHADOW_NEAR + DEPTH_MARGIN.
    const back = halfDepth + SHADOW_NEAR + DEPTH_MARGIN;
    const orthoMaxZ = 2 * halfDepth + SHADOW_NEAR + 2 * DEPTH_MARGIN;

    const sun = createDirectionalLight(d, SUN_INTENSITY);
    sun.position.set(
        VALLEY_CENTER[0] - d[0] * back,
        VALLEY_CENTER[1] - d[1] * back,
        VALLEY_CENTER[2] - d[2] * back,
    );

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: SHADOW_NEAR,
        orthoMaxZ,
    });
    // Making the generator does not link it to the light. Without this line no map is drawn or sampled.
    sun.shadowGenerator = shadows;

    addToScene(scene, sun);

    return { sun, shadows };
}
