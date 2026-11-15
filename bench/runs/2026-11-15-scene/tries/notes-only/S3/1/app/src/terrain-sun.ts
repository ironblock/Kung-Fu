import {
    addToScene,
    createDirectionalLight,
    createPcfDirectionalShadowGenerator,
    setLightIntensity,
} from "@babylonjs/lite";
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

// Valley: 2000 x 2000 square in x/z centred on the origin, everything between y = 0 and y = 400.
const HALF_XZ = 1000;
const CENTER_Y = 200;

// Extra depth kept between the light and the nearest valley point, and beyond the farthest one.
const MARGIN = 100;

export function createValleySun(
    engine: EngineContext,
    scene: SceneContext,
    direction: [number, number, number],
): { sun: DirectionalLight; shadows: ShadowGenerator } {
    const len = Math.hypot(direction[0], direction[1], direction[2]);
    if (!(len > 0)) {
        throw new Error("createValleySun: direction must be non-zero");
    }
    const ux = direction[0] / len;
    const uy = direction[1] / len;
    const uz = direction[2] / len;

    // Half-width of the valley box projected onto the (unit) light direction.
    // The box spans y in [0, 400], so its half-height is 200 around CENTER_Y.
    const r = HALF_XZ * Math.abs(ux) + 200 * Math.abs(uy) + HALF_XZ * Math.abs(uz);

    // Put the light upstream of the valley centre by r + MARGIN. Then every valley point
    // has depth along the light direction in [MARGIN, 2r + MARGIN], so the depth range
    // below covers the whole valley for any direction, with no dependence on the caster list.
    const back = r + MARGIN;
    const sun = createDirectionalLight("valleySun", [ux, uy, uz]);
    sun.position.set(-ux * back, CENTER_Y - uy * back, -uz * back);
    sun.orthoMinZ = 1;
    sun.orthoMaxZ = 2 * r + 2 * MARGIN;
    setLightIntensity(sun, 1.3);
    addToScene(scene, sun);

    const shadows = createPcfDirectionalShadowGenerator(engine, sun, { mapSize: 2048 });
    sun.shadowGenerator = shadows;

    return { sun, shadows };
}
