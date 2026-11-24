import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Valley bounds: 2000 x 2000 square centred on the origin in x and z,
// heights from 0 to 400. Everything on the terrain lies inside this box.
const HALF_X = 1000;
const HALF_Y = 200; // (400 - 0) / 2
const HALF_Z = 1000;
const CENTRE_Y = 200; // (400 + 0) / 2

const SUN_INTENSITY = 1.3;
const SHADOW_MAP_SIZE = 2048;
// Extra depth beyond the valley on each side of the shadow frustum.
const DEPTH_MARGIN = 100;

export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const [dx, dy, dz] = direction;
    const len = Math.hypot(dx, dy, dz);
    const d: [number, number, number] = [dx / len, dy / len, dz / len];

    // Half-extent of the valley box projected onto the light direction, measured
    // from the valley centre. Every valley point has a depth within +/- R of the centre.
    const R = Math.abs(d[0]) * HALF_X + Math.abs(d[1]) * HALF_Y + Math.abs(d[2]) * HALF_Z;

    // Place the light's eye behind the valley (opposite to the light direction),
    // so that the whole valley lies in front of it.
    const eyeDistance = R + DEPTH_MARGIN;
    const cx = 0;
    const cy = CENTRE_Y;
    const cz = 0;
    const eye: [number, number, number] = [
        cx - d[0] * eyeDistance,
        cy - d[1] * eyeDistance,
        cz - d[2] * eyeDistance,
    ];

    const sun = createDirectionalLight(d, SUN_INTENSITY);
    sun.position.set(eye[0], eye[1], eye[2]);
    addToScene(scene, sun);

    // Depth of valley points from the eye ranges over [DEPTH_MARGIN, 2R + DEPTH_MARGIN].
    const shadows = createPcfDirectionalShadowGenerator(engine, sun, {
        mapSize: SHADOW_MAP_SIZE,
        orthoMinZ: 1,
        orthoMaxZ: 2 * R + 2 * DEPTH_MARGIN,
    });
    sun.shadowGenerator = shadows;

    return { sun, shadows };
}
