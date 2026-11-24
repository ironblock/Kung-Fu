import { it, expect } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, pointer, makeScene, tick } from "./helpers";

function setup() {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 10, z: 10 }); // pitched up 45 deg
    cam.inertia = 0;
    const c = makeCanvas();
    attachFreeControl(cam, asCanvas(c), scene);
    return { scene, cam, c };
}

it("n20: W/S move along the look direction including pitch, WASD and arrows both work, Space/Shift move along world Y, any button drag looks", () => {
    let { scene, cam, c } = setup();
    expect(c.tabIndex).toBe(0);
    fire(c, "keydown", key("KeyW"));
    tick(scene);
    expect(cam.position.y).toBeGreaterThan(0);
    expect(cam.position.y).toBeCloseTo(cam.position.z, 6);

    ({ scene, cam, c } = setup());
    fire(c, "keydown", key("ArrowUp"));
    tick(scene);
    expect(cam.position.z).toBeGreaterThan(0);

    ({ scene, cam, c } = setup());
    fire(c, "keydown", key("Space"));
    tick(scene);
    expect(cam.position.y).toBeGreaterThan(0);
    expect(cam.position.z).toBe(0);
    expect(cam.position.x).toBe(0);

    ({ scene, cam, c } = setup());
    const yaw0 = cam._yaw;
    fire(c, "pointerdown", pointer({ button: 1, buttons: 4 }));
    fire(c, "pointermove", pointer({ clientX: 100 }));
    tick(scene);
    expect(cam._yaw).not.toBe(yaw0);
});
