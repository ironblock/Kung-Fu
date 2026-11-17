import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation, flyGeospatialCameraToAsync, attachGeospatialControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, key, makeScene, tick } from "./helpers";

afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

function setup() {
    const win = makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, { radius: 500, pitch: 0.5 });
    const c = makeCanvas();
    attachGeospatialControls(cam, asCanvas(c), scene);
    return { win, scene, cam, c };
}

async function state(p: Promise<void>) {
    let s = "pending";
    p.then(() => (s = "resolved"), () => (s = "rejected"));
    await new Promise((r) => setTimeout(r, 0));
    return s;
}

it("18a: a newer flight resolves the older one; the camera stays where it stopped", async () => {
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    const p1 = flyGeospatialCameraToAsync(cam, scene, { yaw: 1 });
    tick(scene, 10);
    const y = cam.yaw;
    const p2 = flyGeospatialCameraToAsync(cam, scene, { radius: 3000 });
    expect(await state(p1)).toBe("resolved");
    expect(cam.yaw).toBe(y);
    tick(scene, 100);
    expect(await state(p2)).toBe("resolved");
    expect(cam.yaw).toBe(y);
});

it("18b: control input that pans, rotates or zooms ends the flight on the next frame; it resolves", async () => {
    for (const act of ["wheel", "drag", "key"]) {
        const { win, scene, cam, c } = setup();
        const p = flyGeospatialCameraToAsync(cam, scene, { yaw: 2 });
        tick(scene, 5);
        if (act === "wheel") fire(c, "wheel", { deltaY: 100, clientX: 400, clientY: 300 });
        if (act === "drag") { fire(c, "pointerdown", pointer({ button: 2, buttons: 2, clientX: 400, clientY: 300 })); fire(c, "pointermove", pointer({ button: 2, buttons: 2, clientX: 410, clientY: 300 })); }
        if (act === "key") fire(win, "keydown", key("ArrowUp"));
        expect(await state(p)).toBe("pending");
        tick(scene);
        expect(await state(p)).toBe("resolved");
        if (act !== "drag") expect(cam.yaw).toBeLessThan(2 - 0.1);
    }
});

it("18c: a wheel with deltaY 0, a key that maps to nothing, or direct yaw/pitch/radius writes do not end it", async () => {
    const { win, scene, cam, c } = setup();
    const p = flyGeospatialCameraToAsync(cam, scene, { yaw: 2 });
    tick(scene, 5);
    fire(c, "wheel", { deltaY: 0, deltaX: 50, clientX: 400, clientY: 300 });
    fire(win, "keydown", key("KeyQ"));
    cam.yaw = -1;
    cam.pitch = 0.2;
    cam.radius = 900;
    tick(scene, 2);
    expect(await state(p)).toBe("pending");
    expect(cam.yaw).toBeGreaterThan(0); // overwritten by the flight
    tick(scene, 100);
    expect(await state(p)).toBe("resolved");
    expect(cam.yaw).toBeCloseTo(2, 9);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";


async function state3(p: Promise<void>) {
    let s = "pending";
    p.then(() => (s = "resolved"), () => (s = "rejected"));
    await new Promise((r) => setTimeout(r, 0));
    return s;
}

V3.it("18 (after check 3): a flight on a scene disposed mid-flight stays pending; a newer flight still resolves it", async () => {
    const scene = H3.makeScene();
    const cam = L3.createGeospatialCamera({ planetRadius: 1000 });
    const p = L3.flyGeospatialCameraToAsync(cam, scene, { yaw: 1, durationMs: 100 });
    H3.tick(scene, 2);
    L3.disposeScene(scene);
    H3.tick(scene, 100);
    V3.expect(await state3(p)).toBe("pending");
    void L3.flyGeospatialCameraToAsync(cam, H3.makeScene(), { yaw: 2 });
    V3.expect(await state3(p)).toBe("resolved");
});
