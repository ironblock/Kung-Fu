import { it, expect } from "vitest";
import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

V.afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

function ctl(opts?: Parameters<typeof L.attachGeospatialControls>[3]) {
    (globalThis as Record<string, unknown>).window = H.makeCanvas();
    const scene = H.makeScene();
    const cam = L.createGeospatialCamera({ planetRadius: 1000 });
    L.setGeospatialOrientation(cam, { radius: 500, pitch: 0.001 });
    const c = H.makeCanvas();
    L.attachGeospatialControls(cam, H.asCanvas(c), scene, opts);
    return { scene, cam, c };
}

it("48d (after check): attachGeospatialControls reads a new camera.limits object for its wheel-zoom clamp", () => {
    const zoom = (swap: boolean) => {
        const s = ctl();
        if (swap) { const f = L.createGeospatialLimits(1000); f.radiusMin = 480; s.cam.limits = f; }
        for (let i = 0; i < 20; i++) H.fire(s.c, "wheel", { deltaY: -100, clientX: 400, clientY: 300 });
        H.tick(s.scene, 60);
        return s.cam.radius;
    };
    expect(zoom(false)).toBeLessThan(470);
    expect(zoom(true)).toBeGreaterThanOrEqual(479);
});

it("48e (after check): ... and for its pick sphere and its collision floor", () => {
    const s = ctl();
    const f = L.createGeospatialLimits(1200);
    s.cam.limits = f;
    H.fire(s.c, "dblclick", { button: 0, buttons: 0, clientX: 400, clientY: 300 });
    H.tick(s.scene, 1, 2000);
    const e = s.cam.center;
    expect(Math.hypot(e.x, e.y, e.z)).toBeCloseTo(1200, 3);
    const t = ctl({ checkCollisions: true });
    const g = L.createGeospatialLimits(1000);
    g.radiusMin = 600;
    t.cam.limits = g;
    H.tick(t.scene);
    const p = t.cam.position;
    expect(Math.hypot(p.x, p.y, p.z)).toBeCloseTo(1600, 3);
});

import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

V2.it("48 (after check 2): a new camera.limits object is ignored by the camera's clamps, the re-centre's included, but read by the controls' zoom", () => {
    const win = H2.makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = H2.makeScene();
    const cam = L2.createGeospatialCamera({ planetRadius: 1000 });
    cam.limits.pitchMin = 0;
    L2.setGeospatialOrientation(cam, { radius: 100, pitch: 0 });
    L2.attachGeospatialControls(cam, H2.asCanvas(H2.makeCanvas()), scene);
    cam.limits = { ...L2.createGeospatialLimits(1000), radiusMax: 50 };
    cam.radius = 120;
    V2.expect(cam.radius).toBe(120); // own clamps: old object
    H2.fire(win, "keydown", H2.key("ArrowUp"));
    H2.tick(scene);
    H2.fire(win, "keyup", H2.key("ArrowUp"));
    H2.tick(scene); // re-centre
    V2.expect(cam.radius).toBeGreaterThan(100); // not clamped to the new object's 50
});
