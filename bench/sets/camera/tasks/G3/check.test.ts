import { describe, expect, it } from "vitest";
import { attachGeospatialControls, createGeospatialCamera, flyGeospatialCameraToAsync, setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";
import { asCanvas, fire, makeCanvas, makeScene, tick } from "./helpers";
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

    // Added 2026-11-19. The places above have headings inside [-pi, pi), and each flight moves the centre.
    // An answer that compared the heading with no wrap, or compared the centre alone, passed them. These
    // tests read the camera's real pose through its own accessors, kept before the call.
    function own(camera: GeospatialCamera) {
        const get = (k: string) => Object.getOwnPropertyDescriptor(camera, k)!.get!;
        const [y, p, r] = [get("yaw"), get("pitch"), get("radius")];
        return () => ({ yaw: y.call(camera) as number, pitch: p.call(camera) as number, radius: r.call(camera) as number });
    }

    it("settles true for a place whose heading is past half a turn, once the camera is there", async () => {
        const scene = makeScene();
        const camera = newCamera();
        const real = own(camera);
        const place = { yaw: 3.5, pitch: 0.5, radius: 1100, center: { ...paris.center } };
        const state = track(flyToPlace(camera, scene, place, 400));
        await run(scene, 60);
        const s = real();
        expect(Math.abs(Math.atan2(Math.sin(s.yaw - 3.5), Math.cos(s.yaw - 3.5)))).toBeLessThan(1e-4);
        expect(s.pitch).toBeCloseTo(0.5, 4);
        expect(s.radius).toBeCloseTo(1100, 3);
        expect(state.rejected).toBe(false);
        expect(state.value).toBe(true);
    });

    for (const field of ["yaw", "pitch", "radius"] as const) {
        it(`settles false when a flight that changes only the ${field} is cut short`, async () => {
            const scene = makeScene();
            const camera = newCamera();
            const start = { yaw: 0, pitch: 0.2, radius: 1800, center: { ...camera.center } };
            const place = { ...start, center: { ...start.center } };
            if (field === "yaw") place.yaw = 1.2;
            if (field === "pitch") place.pitch = 0.6;
            if (field === "radius") place.radius = 900;
            const state = track(flyToPlace(camera, scene, place, 400));
            await run(scene, 10);
            void flyGeospatialCameraToAsync(camera, scene, { ...start, center: { ...start.center }, durationMs: 200 });
            await run(scene, 60);
            expect(state.rejected).toBe(false);
            expect(state.value).toBe(false);
        });
    }

    it("flies smoothly: part way through, the camera is between where it started and the place", async () => {
        const scene = makeScene();
        const camera = newCamera();
        const real = own(camera);
        const state = track(flyToPlace(camera, scene, paris, 400));
        const seen: { pitch: number; radius: number }[] = [];
        for (let i = 0; i < 4; i++) {
            await run(scene, 3);
            seen.push(real());
        }
        expect(state.value).toBeUndefined();
        for (const s of seen) {
            expect(s.radius).toBeLessThan(1800 - 1e-3);
            expect(s.radius).toBeGreaterThan(900 + 1e-3);
            expect(s.pitch).toBeGreaterThan(0.2 + 1e-6);
            expect(s.pitch).toBeLessThan(0.6 - 1e-6);
        }
        await run(scene, 40);
        expect(state.value).toBe(true);
    });
    // Added 2026-11-19, after a fresh attack. The tests above cut a flight short only with another fly-to.
    // That leaves the new flight's hook on the camera, so an answer that judged arrival by that hook alone
    // passed. "false if the flight was stopped before it got there": here the user's own input, through
    // the library's geospatial controls, stops it.
    it("settles false when the user's input through the library's controls stops the flight", async () => {
        const scene = makeScene();
        const camera = newCamera();
        const canvas = makeCanvas();
        // The library's controls listen on the window too. A run with no stand-in window gets one here.
        const g = globalThis as Record<string, unknown>;
        const hadWindow = typeof g.window !== "undefined";
        if (!hadWindow) g.window = { addEventListener(): void {}, removeEventListener(): void {}, devicePixelRatio: 1 };
        const detach = attachGeospatialControls(camera, asCanvas(canvas), scene);
        const state = track(flyToPlace(camera, scene, paris, 400));
        await run(scene, 8);
        fire(canvas, "wheel", { deltaY: 100, deltaMode: 0, clientX: 400, clientY: 300, offsetX: 400, offsetY: 300 });
        await run(scene, 60);
        detach();
        if (!hadWindow) delete g.window;
        expect(state.rejected).toBe(false);
        expect(state.value).toBe(false);
    });

    // Added 2026-11-19, after a fresh attack. An answer with its own tween passed the tests above, though
    // its centre ran on a straight line through the planet. The ask names the library's fly-to animation.
    // So a library flight to the same place, on a camera and a scene of its own, is what the camera must
    // do, frame by frame. And the promise must not settle while that flight is still going.
    it("flies as the library's fly-to animation does, and settles only once the flight is over", async () => {
        const scene = makeScene();
        const camera = newCamera();
        const real = own(camera);
        const ownCentre = Object.getOwnPropertyDescriptor(camera, "center")?.get;
        const centre = (c: GeospatialCamera) => (ownCentre && c === camera ? ownCentre.call(c) : c.center) as { x: number; y: number; z: number };
        const twinScene = makeScene();
        const twin = newCamera();
        const far = { yaw: -2.2, pitch: 0.7, radius: 1300, center: { x: R * Math.cos(2.4), y: -R * Math.sin(2.4), z: 0 } };
        const state = track(flyToPlace(camera, scene, far, 500));
        let twinDone = false;
        void flyGeospatialCameraToAsync(twin, twinScene, { ...far, center: { ...far.center }, durationMs: 500 }).then(() => {
            twinDone = true;
        });
        for (let i = 0; i < 50; i++) {
            tick(scene, 1, 16);
            tick(twinScene, 1, 16);
            await flush();
            const a = real();
            const c = centre(camera);
            const w = centre(twin);
            expect(Math.abs(a.yaw - twin.yaw)).toBeLessThan(1e-6);
            expect(Math.abs(a.pitch - twin.pitch)).toBeLessThan(1e-6);
            expect(Math.abs(a.radius - twin.radius)).toBeLessThan(1e-6 * R);
            expect(Math.hypot(c.x - w.x, c.y - w.y, c.z - w.z)).toBeLessThan(1e-6 * R);
            expect(Math.abs(Math.hypot(c.x, c.y, c.z) - R)).toBeLessThan(1e-6 * R);
            if (state.value !== undefined) expect(twinDone).toBe(true);
        }
        expect(twinDone).toBe(true);
        expect(state.rejected).toBe(false);
        expect(state.value).toBe(true);
    });
});
