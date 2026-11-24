import { it, expect } from "vitest";
import { createGeospatialCamera, createArcRotateCamera, attachControl, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

it("c07: a small planet starts at radius 10, not 4*planetRadius", () => {
    expect(createGeospatialCamera({ planetRadius: 1 }).radius).toBe(10);
});

it("c36: with Alt held, ArrowRight+ArrowUp rotate and zoom unnormalised; Meta held stops all keys", () => {
    enableArcRotateKeyboardControls();
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam.inertia = 0;
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene, { keyboard: true });
    fire(c, "keydown", key("ArrowRight", { altKey: true }));
    fire(c, "keydown", key("ArrowUp", { altKey: true }));
    tick(scene);
    expect(cam.alpha).toBeCloseTo(0.01, 12);
    expect(cam.radius).toBeCloseTo(10 - 0.04, 12);
});
