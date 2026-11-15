import { clusteredLightsOnGpu, makeGpuScene, refreshClusteredLights } from "./scene-helpers-l";
import { describe, expect, it } from "vitest";
import { addClusteredLightContainer, addToScene, createArcRotateCamera, createClusteredLightContainer, createClusteredPointLight } from "@babylonjs/lite";
import { addLamp } from "../src/lamps";

async function street() {
    const { engine, scene, gpu } = await makeGpuScene();
    const camera = createArcRotateCamera(0, 1, 30, { x: 0, y: 0, z: 0 });
    addToScene(scene, camera);
    const lamps = createClusteredLightContainer();
    createClusteredPointLight(lamps, { position: [-4, 2, 0], diffuse: [1, 1, 1], range: 5, intensity: 2 });
    createClusteredPointLight(lamps, { position: [4, 2, 0], diffuse: [0.5, 0.5, 1], range: 7, intensity: 1 });
    addClusteredLightContainer(scene, lamps);
    refreshClusteredLights(engine, scene); // a frame has run
    return { engine, scene, gpu, lamps };
}

function sorted(lights: number[][]): number[][] {
    return lights.map((l) => l.map((v) => Math.round(v * 1e5) / 1e5)).sort((a, b) => a[0]! - b[0]! || a[1]! - b[1]! || a[2]! - b[2]!);
}

describe("L2 placing street lamps", () => {
    it("adds the lamp to the container and returns it", async () => {
        const s = await street();
        const lamp = addLamp(s.scene, s.lamps, [0, 2, 3], 6);
        expect(s.lamps.pointLights).toContain(lamp);
        expect(s.lamps.pointLights.length).toBe(3);
        expect(lamp.position).toEqual([0, 2, 3]);
        expect(lamp.range).toBe(6);
        expect(lamp.intensity).toBe(1);
        expect(lamp.diffuse).toEqual([1, 0.85, 0.6]);
    });

    it("the next frames run and the GPU holds the new lamp and the old ones", async () => {
        const s = await street();
        addLamp(s.scene, s.lamps, [0, 2, 3], 6);
        expect(() => refreshClusteredLights(s.engine, s.scene)).not.toThrow();
        expect(() => refreshClusteredLights(s.engine, s.scene)).not.toThrow();
        const expected = sorted([
            [-4, 2, 0, 5, 1, 1, 1, 2],
            [4, 2, 0, 7, 0.5, 0.5, 1, 1],
            [0, 2, 3, 6, 1, 0.85, 0.6, 1],
        ]);
        expect(sorted(clusteredLightsOnGpu(s.gpu, 3))).toEqual(expected);
    });

    it("keeps working as more lamps are placed", async () => {
        const s = await street();
        const placed: number[][] = [
            [-4, 2, 0, 5, 1, 1, 1, 2],
            [4, 2, 0, 7, 0.5, 0.5, 1, 1],
        ];
        for (let i = 0; i < 4; i++) {
            addLamp(s.scene, s.lamps, [i * 2, 1, -3], 3 + i);
            placed.push([i * 2, 1, -3, 3 + i, 1, 0.85, 0.6, 1]);
            expect(() => refreshClusteredLights(s.engine, s.scene)).not.toThrow();
        }
        expect(sorted(clusteredLightsOnGpu(s.gpu, placed.length))).toEqual(sorted(placed));
    });
});
