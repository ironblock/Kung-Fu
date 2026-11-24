import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Valley bounds: 2000 x 2000 centred on the origin in x/z, heights 0..400.
const VALLEY_HALF_SIZE = 1000;
const VALLEY_MIN_Y = 0;
const VALLEY_MAX_Y = 400;
const VALLEY_CENTER: [number, number, number] = [0, (VALLEY_MIN_Y + VALLEY_MAX_Y) / 2, 0];

// Farthest any valley point can be from VALLEY_CENTER, so no point lies outside
// the depth range along the light direction, whatever that direction is.
const VALLEY_HALF_HEIGHT = (VALLEY_MAX_Y - VALLEY_MIN_Y) / 2;
const VALLEY_RADIUS = Math.sqrt(
    VALLEY_HALF_SIZE * VALLEY_HALF_SIZE * 2 + VALLEY_HALF_HEIGHT * VALLEY_HALF_HEIGHT,
);
const DEPTH_MARGIN = 100;
const DEPTH_EXTENT = VALLEY_RADIUS + DEPTH_MARGIN;

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;

export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [dx, dy, dz] = direction;
    const length = Math.hypot(dx, dy, dz);
    if (!(length > 0)) {
        throw new Error("createValleySun: direction must be non-zero");
    }
    if (dy >= 0) {
        throw new Error("createValleySun: direction must point downwards (negative y)");
    }
    const unit: [number, number, number] = [dx / length, dy / length, dz / length];

    const sun = createDirectionalLight(unit, SUN_INTENSITY);
    addToScene(scene, sun);

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: -DEPTH_EXTENT,
        orthoMaxZ: DEPTH_EXTENT,
    });

    sun.shadowGenerator = shadows;
    if (!scene.shadowGenerators.includes(shadows)) {
        scene.shadowGenerators.push(shadows);
    }

    return { sun, shadows };
}
