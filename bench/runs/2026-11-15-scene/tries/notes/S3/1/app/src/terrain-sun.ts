import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Valley extent: x and z in [-1000, 1000], y in [0, 400].
const HALF_X = 1000;
const HALF_Z = 1000;
const HALF_Y = 200;
const CENTRE_Y = 200;

// Radius of a sphere centred on the valley's box centre that contains the whole box.
const BOUND_RADIUS = Math.hypot(HALF_X, HALF_Y, HALF_Z);

// Clearance kept between the light and the valley on the near side and the far side.
const MARGIN = 100;

// The light sits this far from the valley centre, back along the light direction.
// Every point of the valley then lies between MARGIN and 2 * BOUND_RADIUS + MARGIN
// along the light direction, measured from the light.
const LIGHT_DISTANCE = BOUND_RADIUS + MARGIN;

export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const length = Math.hypot(direction[0], direction[1], direction[2]);
    if (!(length > 0)) {
        throw new Error("createValleySun: direction must be non-zero");
    }
    const dx = direction[0] / length;
    const dy = direction[1] / length;
    const dz = direction[2] / length;

    const sun = createDirectionalLight([dx, dy, dz], 1.3);
    // Place the light before adding it to the scene so the shadow fit uses this position.
    sun.position.set(
        -dx * LIGHT_DISTANCE,
        CENTRE_Y - dy * LIGHT_DISTANCE,
        -dz * LIGHT_DISTANCE,
    );
    addToScene(scene, sun);

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: 2048,
        orthoMinZ: MARGIN / 2,
        orthoMaxZ: LIGHT_DISTANCE + BOUND_RADIUS + MARGIN,
    });
    sun.shadowGenerator = shadows;

    return { sun, shadows };
}
