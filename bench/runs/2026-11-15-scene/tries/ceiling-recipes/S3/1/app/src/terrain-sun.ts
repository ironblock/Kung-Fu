import { addToScene, createDirectionalLight, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

/** The valley: a 2000-unit square centred on the origin in x and z, holding everything from height 0 to 400. */
const VALLEY_MIN: readonly [number, number, number] = [-1000, 0, -1000];
const VALLEY_MAX: readonly [number, number, number] = [1000, 400, 1000];

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;

/** Slack, in world units, kept between the valley and the shadow map's near and far planes. */
const DEPTH_MARGIN = 10;

/**
 * Creates the valley's sun: a directional light shining along `direction` (any length, pointing down),
 * adds it to `scene`, and gives it a 2048-texel PCF shadow map. Choose the casters with
 * setShadowTaskCasterMeshes on the returned generator.
 *
 * The shadow map's depth range is measured from the light's position along its direction, so the
 * sun is placed upstream of the whole valley box and orthoMinZ/orthoMaxZ are set to span it. That
 * way nothing between height 0 and 400 anywhere on the valley is in front of the near plane or past
 * the far plane, whatever the sun's angle. The ortho width and height are fitted to the caster
 * meshes by the generator.
 *
 * Call this before registerSceneWithShadowSupport: receivers built before the generator exists
 * never sample it. The depth range is computed for this `direction`. If the sun is turned later,
 * make a new one.
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
    const dir: [number, number, number] = [dx / length, dy / length, dz / length];

    // Where the valley box lies along the light: distance s = dot(point, dir) for its nearest
    // and farthest corners, and for its centre.
    let nearest = 0;
    let farthest = 0;
    let centre = 0;
    const centrePoint: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
        const lo = VALLEY_MIN[i] * dir[i];
        const hi = VALLEY_MAX[i] * dir[i];
        nearest += Math.min(lo, hi);
        farthest += Math.max(lo, hi);
        centre += (lo + hi) / 2;
        centrePoint[i] = (VALLEY_MIN[i] + VALLEY_MAX[i]) / 2;
    }

    const sun = createDirectionalLight(dir, SUN_INTENSITY);

    // Put the light on the line through the valley's centre, 2 * DEPTH_MARGIN before the valley's
    // nearest corner. Then every point of the valley is between 2 * DEPTH_MARGIN and
    // (depth span + 2 * DEPTH_MARGIN) in front of the light.
    const back = nearest - 2 * DEPTH_MARGIN - centre;
    sun.position.x = centrePoint[0] + dir[0] * back;
    sun.position.y = centrePoint[1] + dir[1] * back;
    sun.position.z = centrePoint[2] + dir[2] * back;

    addToScene(scene, sun);

    // Near and far planes leave DEPTH_MARGIN of slack on each side of the valley. orthoMinZ is
    // kept non-zero in case the library treats 0 as "use the default".
    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: DEPTH_MARGIN,
        orthoMaxZ: farthest - nearest + 3 * DEPTH_MARGIN,
    });
    // Creating the generator does not link it, and addToScene(scene, shadows) would not either.
    sun.shadowGenerator = shadows;

    return { sun, shadows };
}
