import * as L2 from "@babylonjs/lite";
import * as V2 from "vitest";

V2.it("22 (after check 2): field writes to a hand-made ortho object wait for a fov/near/far/aspect/view change; the returned bounds do not", () => {
    const cam = L2.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const own = L2.enableOrthographicCamera(cam, { halfHeight: 2 });
    const byHand = { halfHeight: 3, left: null, right: null, bottom: null, top: null };
    cam.ortho = byHand;
    cam.fov = 1.1; // rebuild: the hand-made object is now used
    V2.expect(L2.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 3, 6);
    byHand.halfHeight = 5;
    V2.expect(L2.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 3, 6); // not seen
    cam.nearPlane = 0.2;
    V2.expect(L2.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 5, 6); // seen now
    cam.ortho = own; // the returned bounds, set back by hand
    own.halfHeight = 4; // its setter invalidates this camera
    V2.expect(L2.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 4, 6);
    // bounds returned for another camera invalidate that camera, not this one
    const other = L2.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const foreign = L2.enableOrthographicCamera(other, { halfHeight: 6 });
    cam.ortho = foreign;
    cam.alpha = 0.5;
    V2.expect(L2.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 6, 6);
    foreign.halfHeight = 8;
    V2.expect(L2.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 6, 6);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";


type Lite3 = typeof import("@babylonjs/lite");
async function load3(rightHanded: boolean): Promise<Lite3> {
    V3.vi.resetModules();
    V3.vi.doUnmock("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system.ts");
    if (rightHanded) {
        V3.vi.doMock("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system.ts", () => import("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system-rh.ts"));
    }
    return (await import("@babylonjs/lite")) as Lite3;
}

V3.it("22 (after check 3): a write to the camera's earlier returned bounds makes a hand-made object show", () => {
    const cam = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const own = L3.enableOrthographicCamera(cam, { halfHeight: 2 });
    V3.expect(L3.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 2, 6);
    cam.ortho = { halfHeight: 3, left: null, right: null, bottom: null, top: null };
    V3.expect(L3.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 2, 6);
    own.halfHeight = 7; // no longer camera.ortho
    V3.expect(L3.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 3, 6);
});

V3.it("22 (after check 3): before enableOrthographicCamera has run anywhere a hand-made object stays unused after a fov change", async () => {
    const F = await load3(false);
    const cam = F.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    F.getProjectionMatrix(cam, 1);
    cam.ortho = { halfHeight: 3, left: null, right: null, bottom: null, top: null };
    cam.fov = 1.1;
    V3.expect(F.getProjectionMatrix(cam, 1)[11]).toBe(1); // perspective
});
