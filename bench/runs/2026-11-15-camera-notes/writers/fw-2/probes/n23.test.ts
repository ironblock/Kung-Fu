import { describe, it, expect } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, pointer, makeScene, tick } from "./helpers";

function setup() {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const canvas = makeCanvas();
    attachFreeControl(cam, asCanvas(canvas), scene);
    return { scene, cam, canvas };
}

describe("n23 attachFreeControl keys: WASD and arrows move, Space/PageUp up, Shift/PageDown down; any button drags to look", () => {
    it("KeyD strafes right (+X when facing +Z)", () => {
        const { scene, cam, canvas } = setup();
        fire(canvas, "keydown", key("KeyD"));
        tick(scene);
        expect(cam.position.x).toBeGreaterThan(0);
    });
    it("Space moves up, ShiftLeft moves down", () => {
        const { scene, cam, canvas } = setup();
        fire(canvas, "keydown", key("Space"));
        tick(scene);
        expect(cam.position.y).toBeGreaterThan(0);
        const s2 = setup();
        fire(s2.canvas, "keydown", key("ShiftLeft"));
        tick(s2.scene);
        expect(s2.cam.position.y).toBeLessThan(0);
    });
    it("a right-button drag turns the camera", () => {
        const { scene, cam, canvas } = setup();
        fire(canvas, "pointerdown", pointer({ button: 2, buttons: 2 }));
        fire(canvas, "pointermove", pointer({ button: 2, buttons: 2, clientX: 200 }));
        tick(scene);
        expect(cam.target.x).toBeGreaterThan(0);
    });
    it("a middle-button drag turns the camera too", () => {
        const { scene, cam, canvas } = setup();
        fire(canvas, "pointerdown", pointer({ button: 1, buttons: 4 }));
        fire(canvas, "pointermove", pointer({ button: 1, buttons: 4, clientX: 200 }));
        tick(scene);
        expect(cam.target.x).toBeGreaterThan(0);
    });
    it("one 16 ms frame of KeyW moves speed * 16 / sqrt(100000) forward", () => {
        const { scene, cam, canvas } = setup();
        fire(canvas, "keydown", key("KeyW"));
        tick(scene, 1, 16);
        expect(cam.position.z).toBeCloseTo((2 * 16) / Math.sqrt(100000), 10);
    });
    it("nothing moves without a scene", () => {
        const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const canvas = makeCanvas();
        attachFreeControl(cam, asCanvas(canvas));
        fire(canvas, "keydown", key("KeyW"));
        expect(cam.position.z).toBe(0);
    });
});
