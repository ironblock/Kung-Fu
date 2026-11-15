import { addToScene, createDirectionalLight, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// The valley: a 2000 x 2000 square centred on the origin in x and z, with
// everything on it (ground, rocks, trees, towers) between heights 0 and 400.
// Described as the centre and half-size of that box.
const VALLEY_CENTER = [0, 200, 0] as const;
const VALLEY_HALF_SIZE = [1000, 200, 1000] as const;

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;

// The directional shadow map only covers depths orthoMinZ..orthoMaxZ in front
// of the light's world position, along its direction. Its default position is
// the origin, which would put everything above the ground's centre behind the
// light. Its width and height already fit the casters, so only depth needs
// setting here.
const ORTHO_MIN_Z = 1;
// Extra room kept before the nearest point of the valley and after the farthest.
const DEPTH_MARGIN = 10;

/**
 * Creates the valley's sun: a directional light shining along `direction`
 * (any length, must not be zero) with intensity 1.3, added to `scene`, with a
 * 2048-texel PCF shadow map. Other code chooses which meshes cast shadows.
 *
 * The light sits back along its own direction from the centre of the valley,
 * and the shadow depth range is set so that the whole valley box (x and z in
 * -1000..1000, y in 0..400) lies inside it whatever the direction.
 *
 * If the scene has already been built, call `rebuildSceneRenderables(scene)`
 * afterwards. Materials that are already built do not pick up a light or
 * shadow generator added later.
 */
export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [x, y, z] = direction;
    const length = Math.hypot(x, y, z);
    if (!(length > 0) || !Number.isFinite(length)) {
        throw new RangeError(`createValleySun: direction must be a finite, non-zero vector, got [${direction.join(", ")}]`);
    }
    const dx = x / length;
    const dy = y / length;
    const dz = z / length;

    // Measured along the light direction, the valley box spans the centre's
    // depth plus or minus this much.
    const halfDepth =
        VALLEY_HALF_SIZE[0] * Math.abs(dx) + VALLEY_HALF_SIZE[1] * Math.abs(dy) + VALLEY_HALF_SIZE[2] * Math.abs(dz);

    // Put the light this far back from the valley centre, so the nearest valley
    // point is ORTHO_MIN_Z + DEPTH_MARGIN in front of it and the farthest is
    // 2 * halfDepth further.
    const distance = ORTHO_MIN_Z + DEPTH_MARGIN + halfDepth;
    const orthoMaxZ = distance + halfDepth + DEPTH_MARGIN;

    const sun = createDirectionalLight([dx, dy, dz], SUN_INTENSITY);
    sun.position.set(
        VALLEY_CENTER[0] - dx * distance,
        VALLEY_CENTER[1] - dy * distance,
        VALLEY_CENTER[2] - dz * distance,
    );

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: ORTHO_MIN_Z,
        orthoMaxZ,
    });

    // The generator is attached through the light; addToScene(scene, shadows)
    // would add it to nothing.
    sun.shadowGenerator = shadows;
    addToScene(scene, sun);

    return { sun, shadows };
}
