import { addToScene, createDirectionalLight, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// The valley: a 2000 x 2000 square centred on the origin in x/z, with everything on it between heights 0 and 400.
const VALLEY_HALF_SIZE = 1000;
const VALLEY_MIN_Y = 0;
const VALLEY_MAX_Y = 400;

// Spare depth kept between the valley and each end of the shadow depth range.
const DEPTH_MARGIN = 10;

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;
const SHADOW_MIN_Z = 1;

export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [x, y, z] = direction;
    const length = Math.hypot(x, y, z);
    if (!Number.isFinite(length) || length === 0) {
        throw new RangeError(`createValleySun: direction must be a finite, non-zero vector, got [${direction.join(", ")}]`);
    }
    const dx = x / length;
    const dy = y / length;
    const dz = z / length;

    const sun = createDirectionalLight([dx, dy, dz], SUN_INTENSITY);

    // A directional PCF shadow map only keeps casters whose distance along `direction` from the light's
    // position lies within orthoMinZ..orthoMaxZ (scene-notes.md, note 6). Left at the origin, the light would
    // drop everything on the near side of it, i.e. most of the valley above ground level. So put the light
    // behind the whole valley along the direction and size the depth range to hold all of it. The sideways
    // extent of the map is fitted by the library to the caster meshes (note 34), so only depth needs setting.
    const centreY = (VALLEY_MIN_Y + VALLEY_MAX_Y) / 2;
    const halfHeight = (VALLEY_MAX_Y - VALLEY_MIN_Y) / 2;
    // Half of the valley box's extent measured along the (unit) light direction.
    const halfDepth = VALLEY_HALF_SIZE * Math.abs(dx) + halfHeight * Math.abs(dy) + VALLEY_HALF_SIZE * Math.abs(dz);
    const standOff = halfDepth + DEPTH_MARGIN;
    sun.position.x = -dx * standOff;
    sun.position.y = centreY - dy * standOff;
    sun.position.z = -dz * standOff;
    // Every valley point is now standOff +/- halfDepth from the light, i.e. within
    // [DEPTH_MARGIN, 2 * halfDepth + DEPTH_MARGIN], which sits inside [SHADOW_MIN_Z, 2 * standOff].

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: SHADOW_MIN_Z,
        orthoMaxZ: 2 * standOff,
    });

    // The shadow task only finds generators through light.shadowGenerator; addToScene(scene, generator)
    // does nothing (note 3). Attach it before the light enters the scene.
    sun.shadowGenerator = shadows;
    addToScene(scene, sun);

    return { sun, shadows };
}
