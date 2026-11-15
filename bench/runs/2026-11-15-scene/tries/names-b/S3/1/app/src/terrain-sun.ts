import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Valley bounds: 2000 x 2000 units centred on the origin in x/z, heights 0..400.
const VALLEY_SIZE_XZ = 2000;
const VALLEY_HEIGHT = 400;

// Largest distance between any two points of the valley box (its 3D diagonal).
// The shadow camera's depth origin lies somewhere inside the valley, so any valley
// point is at most this far from it along any direction. Using this as the
// near/far half-range makes the depth range independent of light direction.
const VALLEY_DIAGONAL = Math.hypot(VALLEY_SIZE_XZ, VALLEY_HEIGHT, VALLEY_SIZE_XZ);

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;

export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const sun = createDirectionalLight(direction, SUN_INTENSITY);
    addToScene(scene, sun);

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: -VALLEY_DIAGONAL,
        orthoMaxZ: VALLEY_DIAGONAL,
    });

    return { sun, shadows };
}
