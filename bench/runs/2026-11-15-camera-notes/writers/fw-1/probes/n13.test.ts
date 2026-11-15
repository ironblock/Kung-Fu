import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

function setup() {
    enableArcRotateKeyboardControls();
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam.inertia = 0;
    cam.panningInertia = 0;
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene, { keyboard: true });
    return { scene, cam, c };
}

it("n13: held ArrowRight adds 1/100 to alpha per frame; ArrowUp lowers beta; Alt+ArrowUp lowers radius by 1/25; Ctrl pans", () => {
    let { scene, cam, c } = setup();
    fire(c, "keydown", key("ArrowRight"));
    tick(scene, 2);
    expect(cam.alpha).toBeCloseTo(1.02, 10);
    fire(c, "keyup", key("ArrowRight"));
    fire(c, "keydown", key("ArrowUp"));
    tick(scene);
    expect(cam.beta).toBeCloseTo(0.99, 10);

    ({ scene, cam, c } = setup());
    fire(c, "keydown", key("ArrowUp", { altKey: true }));
    tick(scene);
    expect(cam.radius).toBeCloseTo(10 - 0.04, 10);
    expect(cam.beta).toBe(1);

    ({ scene, cam, c } = setup());
    fire(c, "keydown", key("ArrowRight", { ctrlKey: true }));
    tick(scene);
    expect(cam.alpha).toBe(1);
    expect(Math.hypot(cam.target.x, cam.target.y, cam.target.z)).toBeGreaterThan(0);
});

it("n13b: two held arrows share the step: ArrowRight with ArrowDown adds 0.01/sqrt(2) to alpha and to beta", () => {
    const { scene, cam, c } = setup();
    fire(c, "keydown", key("ArrowRight"));
    fire(c, "keydown", key("ArrowDown"));
    tick(scene);
    expect(cam.alpha).toBeCloseTo(1 + 0.01 / Math.SQRT2, 10);
    expect(cam.beta).toBeCloseTo(1 + 0.01 / Math.SQRT2, 10);
});
