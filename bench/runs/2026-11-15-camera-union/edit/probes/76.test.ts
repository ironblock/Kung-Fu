import * as V2 from "vitest";
import * as H2 from "./helpers";

type Lite = typeof import("@babylonjs/lite");

async function load2(rightHanded: boolean): Promise<Lite> {
    V2.vi.resetModules();
    V2.vi.doUnmock("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system.ts");
    if (rightHanded) {
        V2.vi.doMock("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system.ts", () => import("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system-rh.ts"));
    }
    return (await import("@babylonjs/lite")) as Lite;
}

V2.afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

function geo(L: Lite) {
    (globalThis as Record<string, unknown>).window = H2.makeCanvas();
    const scene = H2.makeScene();
    const cam = L.createGeospatialCamera({ planetRadius: 1000 });
    L.setGeospatialOrientation(cam, { radius: 500, pitch: 0.8 });
    const c = H2.makeCanvas();
    L.attachGeospatialControls(cam, H2.asCanvas(c), scene);
    H2.fire(c, "pointerdown", H2.pointer({ button: 2, buttons: 2, clientX: 0, clientY: 0 }));
    H2.fire(c, "pointermove", H2.pointer({ button: 2, buttons: 2, clientX: 20, clientY: -10 }));
    H2.tick(scene);
    const east = L.createGeospatialCamera({ planetRadius: 1000 });
    L.setGeospatialOrientation(east, { yaw: Math.PI / 2, pitch: 1, radius: 500 });
    return { yaw: cam.yaw, pitch: cam.pitch, eastLookY: east._lookAt.y };
}

V2.it("76 (after check 2): attachGeospatialControls flips nothing in the right-handed build; east (yaw PI/2) points to +Y at a +X center there", async () => {
    const l = geo(await load2(false));
    const r = geo(await load2(true));
    V2.expect(l.yaw).toBeCloseTo(20 * Math.PI / 500, 12);
    V2.expect(r.yaw).toBe(l.yaw);
    V2.expect(r.pitch).toBe(l.pitch);
    V2.expect(l.eastLookY).toBeLessThan(-0.5);
    V2.expect(r.eastLookY).toBeGreaterThan(0.5);
});
