import { describe, expect, it } from "vitest";
import { makeEngine, makeSceneOn, project, worldCorners } from "./scene-helpers-s";
import { createBox } from "@babylonjs/lite";
import { computeDirectionalLightMatrix } from "../../babylon-lite/packages/babylon-lite/src/shadow/shadow-base";
import { createValleySun } from "../src/terrain-sun";

const DIRECTIONS: [number, number, number][] = [
    [0.5, -1, 0.3],
    [-0.8, -0.4, -0.6],
    [0, -1, 0],
    [3, -2, -4],
];

describe("S3 a sun for the whole valley", () => {
    it("makes a directional sun of intensity 1.3 along the direction, in the scene", () => {
        for (const direction of DIRECTIONS) {
            const engine = makeEngine();
            const scene = makeSceneOn(engine);
            const { sun, shadows } = createValleySun(engine, scene, direction);
            expect(sun.lightType).toBe("directional");
            expect(sun.intensity).toBeCloseTo(1.3, 6);
            expect(scene.lights).toContain(sun);
            const len = Math.hypot(...direction);
            const d = [sun.direction.x, sun.direction.y, sun.direction.z];
            const dl = Math.hypot(d[0]!, d[1]!, d[2]!);
            for (let i = 0; i < 3; i++) {
                expect(d[i]! / dl).toBeCloseTo(direction[i]! / len, 4);
            }
            expect(shadows._shadowType).toBe("pcf");
            expect(shadows._light).toBe(sun);
            expect(shadows._config._mapSize).toBe(2048);
        }
    });

    it("covers every corner of the valley in the shadow map, depth included", () => {
        for (const direction of DIRECTIONS) {
            const engine = makeEngine();
            const scene = makeSceneOn(engine);
            const { sun, shadows } = createValleySun(engine, scene, direction);
            // Casters at the far corners of the valley, low and high: the generator fits its map to these.
            const casters = [];
            for (const [x, z] of [[-995, -995], [995, -995], [-995, 995], [995, 995], [0, 0]] as const) {
                for (const y of [5, 395]) {
                    const box = createBox(engine, 10);
                    box.position.set(x, y, z);
                    casters.push(box);
                }
            }
            const cfg = shadows._config;
            const { _viewProj } = computeDirectionalLightMatrix(sun, casters, cfg._orthoMinZ!, cfg._orthoMaxZ!);
            for (const caster of casters) {
                for (const corner of worldCorners(caster)) {
                    const [x, y, z] = project(_viewProj, corner);
                    expect(Math.abs(x)).toBeLessThanOrEqual(1 + 1e-6);
                    expect(Math.abs(y)).toBeLessThanOrEqual(1 + 1e-6);
                    expect(z).toBeGreaterThanOrEqual(0);
                    expect(z).toBeLessThanOrEqual(1);
                }
            }
        }
    });
});
