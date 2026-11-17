import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.it("02 (after check 2): keys feed the offsets only in the frame step of their own attachControl, which needs a scene", () => {
    L2.enableArcRotateKeyboardControls();
    const scene = H2.makeScene();
    const cam = L2.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c1 = H2.makeCanvas();
    L2.attachControl(cam, H2.asCanvas(c1), undefined, { keyboard: true });
    H2.fire(c1, "keydown", H2.key("ArrowLeft"));
    V2.expect(cam.inertialAlphaOffset).toBe(0);
    L2.attachControl(cam, H2.asCanvas(H2.makeCanvas()), scene);
    H2.tick(scene, 5);
    V2.expect(cam.inertialAlphaOffset).toBe(0);
    V2.expect(cam.alpha).toBe(1);
    // the same key on an attachControl given the scene does move it
    const c3 = H2.makeCanvas();
    L2.attachControl(cam, H2.asCanvas(c3), scene, { keyboard: true });
    H2.fire(c3, "keydown", H2.key("ArrowLeft"));
    H2.tick(scene);
    V2.expect(cam.alpha).not.toBe(1);
});
