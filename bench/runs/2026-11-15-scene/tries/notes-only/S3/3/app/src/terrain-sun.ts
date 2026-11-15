import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Valley terrain: x and z in [-1000, 1000], y in [0, 400].
const HALF_XZ = 1000;
const HALF_Y = 200;
const CENTER_Y = 200;

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;

// Distance kept between the light and the valley's bounding sphere. The shadow
// depth range is measured from the light, and casters within 1 unit of it are
// dropped, so this must stay well clear of that.
const LIGHT_MARGIN = 100;

export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const length = Math.hypot(direction[0], direction[1], direction[2]);
    if (!(length > 0)) {
        throw new Error("createValleySun: direction must be non-zero");
    }
    const d: [number, number, number] = [direction[0] / length, direction[1] / length, direction[2] / length];
    if (!(d[1] < 0)) {
        throw new Error("createValleySun: direction must point downwards");
    }

    // Every point of the valley lies inside this sphere around the valley centre.
    const center: [number, number, number] = [0, CENTER_Y, 0];
    const radius = Math.hypot(HALF_XZ, HALF_Y, HALF_XZ);

    // Put the light far enough back along -direction that the whole sphere lies
    // ahead of it. Depth from the light to any valley point then falls in
    // [LIGHT_MARGIN, LIGHT_MARGIN + 2 * radius], about [100, 2958], inside the
    // default depth range of 1..10000. This holds for any direction.
    const back = radius + LIGHT_MARGIN;
    const position: [number, number, number] = [
        center[0] - d[0] * back,
        center[1] - d[1] * back,
        center[2] - d[2] * back,
    ];

    const sun = createDirectionalLight(d);
    sun.position.set(position[0], position[1], position[2]);
    sun.direction.set(d[0], d[1], d[2]);
    sun.intensity = SUN_INTENSITY;

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, { mapSize: SHADOW_MAP_SIZE });
    // Set the generator before the light joins the scene, so no rebuild is needed.
    sun.shadowGenerator = shadows;
    addToScene(scene, sun);

    return { sun, shadows };
}
