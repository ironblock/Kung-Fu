import { describe, expect, it } from "vitest";
import { createGeospatialCamera, flyGeospatialCameraToAsync, setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";
import { flyToPlace } from "../src/fly-to-place";

const R = 1000;

function newCamera(): GeospatialCamera {
    const camera = createGeospatialCamera({ planetRadius: R });
    setGeospatialOrientation(camera, { radius: 1800, pitch: 0.2, yaw: 0 });
    return camera;
}

const paris = { yaw: 1.0, pitch: 0.6, radius: 900, center: { x: R * Math.cos(0.3), y: -R * Math.sin(0.3), z: 0 } };
const tokyo = { yaw: -0.5, pitch: 0.3, radius: 1200, center: { x: R * Math.cos(0.6), y: 0, z: R * Math.sin(0.6) } };

async function flush(): Promise<void> {
    for (let i = 0; i < 5; i++) {
        await Promise.resolve();
    }
}

function track(p: Promise<boolean>): { value: boolean | undefined; rejected: boolean } {
    const state = { value: undefined as boolean | undefined, rejected: false };
    p.then(
        (v) => {
            state.value = v;
        },
        () => {
            state.rejected = true;
        },
    );
    return state;
}

async function run(scene: ReturnType<typeof makeScene>, frames: number): Promise<void> {
    for (let i = 0; i < frames; i++) {
        tick(scene, 1, 16);
        await flush();
    }
}

describe("G3 flyToPlace", () => {
    it("settles true once the camera has arrived, and not before", async () => {
        const scene = makeScene();
        const camera = newCamera();
        const state = track(flyToPlace(camera, scene, paris, 400));
        await run(scene, 10);
        expect(state.value).toBeUndefined();
        await run(scene, 40);
        expect(state.rejected).toBe(false);
        expect(state.value).toBe(true);
        expect(camera.radius).toBeCloseTo(900, 3);
        expect(camera.yaw).toBeCloseTo(1.0, 3);
    });

    it("settles false when another fly-to from elsewhere in the app takes over", async () => {
        const scene = makeScene();
        const camera = newCamera();
        const state = track(flyToPlace(camera, scene, paris, 400));
        await run(scene, 10);
        void flyGeospatialCameraToAsync(camera, scene, { yaw: tokyo.yaw, pitch: tokyo.pitch, radius: tokyo.radius, center: tokyo.center, durationMs: 300 });
        await run(scene, 60);
        expect(state.rejected).toBe(false);
        expect(state.value).toBe(false);
    });

    it("settles false for the first and true for the second when flyToPlace is called twice", async () => {
        const scene = makeScene();
        const camera = newCamera();
        const first = track(flyToPlace(camera, scene, paris, 400));
        await run(scene, 12);
        const second = track(flyToPlace(camera, scene, tokyo, 300));
        await run(scene, 60);
        expect(first.rejected).toBe(false);
        expect(second.rejected).toBe(false);
        expect(first.value).toBe(false);
        expect(second.value).toBe(true);
    });
});
