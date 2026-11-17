import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

L2.enableArcRotateKeyboardControls();

function setup() {
    const scene = H2.makeScene();
    const cam = L2.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam.inertia = 0;
    cam.panningInertia = 1;
    const c = H2.makeCanvas();
    L2.attachControl(cam, H2.asCanvas(c), scene, { keyboard: true });
    return { scene, cam, c };
}

V2.it("50 (after check 2): Ctrl arrows add 1/50 to the pan offsets, a diagonal scaled by 1/sqrt(2); Alt adds unscaled 1/100 to alpha and 1/25 to radius", () => {
    let { scene, cam, c } = setup();
    H2.fire(c, "keydown", H2.key("ArrowRight", { ctrlKey: true }));
    H2.tick(scene);
    V2.expect(cam.inertialPanningX).toBeCloseTo(1 / 50, 12);
    ({ scene, cam, c } = setup());
    H2.fire(c, "keydown", H2.key("ArrowRight", { ctrlKey: true }));
    H2.fire(c, "keydown", H2.key("ArrowUp", { ctrlKey: true }));
    H2.tick(scene);
    V2.expect(cam.inertialPanningX).toBeCloseTo(Math.SQRT1_2 / 50, 12);
    V2.expect(cam.inertialPanningY).toBeCloseTo(Math.SQRT1_2 / 50, 12);
    ({ scene, cam, c } = setup());
    H2.fire(c, "keydown", H2.key("ArrowUp", { altKey: true }));
    H2.fire(c, "keydown", H2.key("ArrowRight", { altKey: true }));
    H2.tick(scene);
    V2.expect(cam.alpha - 1).toBeCloseTo(1 / 100, 12);
    V2.expect(10 - cam.radius).toBeCloseTo(1 / 25, 12);
    ({ scene, cam, c } = setup());
    H2.fire(c, "keydown", H2.key("ArrowDown", { altKey: true }));
    H2.tick(scene);
    V2.expect(cam.radius - 10).toBeCloseTo(1 / 25, 12);
});
