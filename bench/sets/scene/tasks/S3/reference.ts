import { addToScene, createDirectionalLight, createPcfDirectionalShadowGenerator } from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

export function createValleySun(engine: EngineContext, scene: SceneContext, direction: [number, number, number]): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const length = Math.hypot(direction[0], direction[1], direction[2]);
    const d: [number, number, number] = [direction[0] / length, direction[1] / length, direction[2] / length];
    const sun = createDirectionalLight(d, 1.3);
    // The shadow view starts at the light's position and keeps depths from orthoMinZ (1) to orthoMaxZ (10000)
    // in front of it. Put the light well back along its direction, beyond the whole valley.
    const back = 3000;
    sun.position.set(-d[0] * back, 200 - d[1] * back, -d[2] * back);
    const shadows = createPcfDirectionalShadowGenerator(engine, sun, { mapSize: 2048 });
    sun.shadowGenerator = shadows;
    addToScene(scene, sun);
    return { sun, shadows };
}
