import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Valley terrain: 2000 x 2000 units centred on the origin in x and z,
// with everything on it between height 0 and 400.
const HALF_EXTENT = 1000;
const MIN_HEIGHT = 0;
const MAX_HEIGHT = 400;
const SHADOW_MAP_SIZE = 2048;
const SUN_INTENSITY = 1.3;

type Vec3 = [number, number, number];

function dot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: Vec3, b: Vec3): Vec3 {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function normalize(a: Vec3): Vec3 {
    const len = Math.hypot(a[0], a[1], a[2]);
    if (len === 0) {
        throw new Error("createValleySun: direction must be non-zero");
    }
    return [a[0] / len, a[1] / len, a[2] / len];
}

/**
 * Creates the valley sun and a PCF shadow generator whose orthographic shadow
 * volume encloses the whole valley volume, so any caster at any height in
 * [0, 400] inside the terrain square can cast into the map.
 *
 * The volume is the tight light-space bounding box of the 8 corners of the
 * valley box, so it does not depend on which meshes are added later.
 */
export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const d = normalize(direction);

    // Light-space basis: d is the forward (view) axis; r and u span the shadow plane.
    const helper: Vec3 = Math.abs(d[1]) > 0.99 ? [1, 0, 0] : [0, 1, 0];
    const r = normalize(cross(helper, d));
    const u = cross(d, r);

    // Project the 8 corners of the valley box into light space.
    let minR = Infinity, maxR = -Infinity;
    let minU = Infinity, maxU = -Infinity;
    let minD = Infinity, maxD = -Infinity;
    for (const x of [-HALF_EXTENT, HALF_EXTENT]) {
        for (const y of [MIN_HEIGHT, MAX_HEIGHT]) {
            for (const z of [-HALF_EXTENT, HALF_EXTENT]) {
                const p: Vec3 = [x, y, z];
                const pr = dot(p, r);
                const pu = dot(p, u);
                const pd = dot(p, d);
                minR = Math.min(minR, pr);
                maxR = Math.max(maxR, pr);
                minU = Math.min(minU, pu);
                maxU = Math.max(maxU, pu);
                minD = Math.min(minD, pd);
                maxD = Math.max(maxD, pd);
            }
        }
    }

    // Small margin against floating-point error at the edges.
    const margin = 1;

    // Place the light origin just before the nearest corner along d, so that
    // the depth range [shadowMinZ, shadowMaxZ] is measured from there and
    // covers the whole box. The origin has zero r/u components, so the
    // r/u extents above apply directly.
    const originDepth = minD - margin;
    const sun = createDirectionalLight(direction);
    sun.intensity = SUN_INTENSITY;
    sun.position.x = d[0] * originDepth;
    sun.position.y = d[1] * originDepth;
    sun.position.z = d[2] * originDepth;

    sun.autoUpdateExtends = false;
    sun.orthoLeft = minR - margin;
    sun.orthoRight = maxR + margin;
    sun.orthoBottom = minU - margin;
    sun.orthoTop = maxU + margin;
    sun.shadowMinZ = margin;
    sun.shadowMaxZ = maxD - originDepth + margin;

    addToScene(scene, sun);

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, SHADOW_MAP_SIZE);
    sun.shadowGenerator = shadows;

    return { sun, shadows };
}
