import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

L2.enableArcRotateKeyboardControls();

function setup() {
    const scene = H2.makeScene();
    const cam = L2.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam.inertia = 0;
    cam.panningInertia = 1;
    const c = H2.makeCanvas();
    L2.attachControl(cam, H2.asCanvas(c), scene, { keyboard: { keys: { left: ["KeyA"] } } });
    return { scene, cam, c };
}

V2.it("17 (after check 2): a list for one direction replaces its arrow only; the others keep their arrows; Ctrl and Alt act on listed keys", () => {
    let { scene, cam, c } = setup();
    H2.fire(c, "keydown", H2.key("ArrowLeft"));
    H2.tick(scene);
    V2.expect(cam.alpha).toBe(0);
    ({ scene, cam, c } = setup());
    H2.fire(c, "keydown", H2.key("KeyA"));
    H2.tick(scene);
    V2.expect(cam.alpha).toBeCloseTo(-0.01, 12);
    ({ scene, cam, c } = setup());
    H2.fire(c, "keydown", H2.key("ArrowRight"));
    H2.tick(scene);
    V2.expect(cam.alpha).toBeCloseTo(0.01, 12);
    ({ scene, cam, c } = setup());
    H2.fire(c, "keydown", H2.key("KeyA", { ctrlKey: true }));
    H2.tick(scene);
    V2.expect(cam.alpha).toBe(0);
    V2.expect(cam.inertialPanningX).toBeCloseTo(-1 / 50, 12);
    ({ scene, cam, c } = setup());
    H2.fire(c, "keydown", H2.key("KeyA", { altKey: true }));
    H2.tick(scene);
    V2.expect(cam.alpha).toBeCloseTo(-0.01, 12);
});
