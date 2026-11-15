import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Terrain: x and z in [-1000, 1000], y in [0, 400].
// Its centre is (0, 200, 0). The furthest point from that centre is a corner,
// at distance sqrt(1000^2 + 200^2 + 1000^2) ≈ 1428.3. The centre itself lies
// 200 units from the origin, so for any light direction the signed depth of
// every valley point, measured from the origin along the light direction, lies
// within [-1628, 1628]. A symmetric ±1700 range covers that with margin.
const VALLEY_DEPTH_EXTENT = 1700;

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;

export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [dx, dy, dz] = direction;
    if (!(Math.hypot(dx, dy, dz) > 0)) {
        throw new Error("createValleySun: direction must be non-zero");
    }
    if (!(dy < 0)) {
        throw new Error("createValleySun: direction must point downwards (y < 0)");
    }

    const sun = createDirectionalLight([dx, dy, dz], SUN_INTENSITY);
    addToScene(scene, sun);

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: -VALLEY_DEPTH_EXTENT,
        orthoMaxZ: VALLEY_DEPTH_EXTENT,
    });
    sun.shadowGenerator = shadows;
    addToScene(scene, shadows);

    return { sun, shadows };
}
