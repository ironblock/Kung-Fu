import { expect, test } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

test("attachFreeControl: WASD and arrows move, Space/PageUp go up, Shift/PageDown down; keys come from the canvas by code", () => {
    // camera at origin looking along +Z: forward +Z, right +X, up +Y
    const cases: [string, "x" | "y" | "z", number][] = [
        ["KeyW", "z", 1], ["ArrowUp", "z", 1], ["KeyS", "z", -1], ["ArrowDown", "z", -1],
        ["KeyD", "x", 1], ["ArrowRight", "x", 1], ["KeyA", "x", -1], ["ArrowLeft", "x", -1],
        ["Space", "y", 1], ["PageUp", "y", 1], ["ShiftLeft", "y", -1], ["ShiftRight", "y", -1], ["PageDown", "y", -1],
    ];
    for (const [code, axis, sign] of cases) {
        const scene = makeScene();
        const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const canvas = makeCanvas();
        attachFreeControl(cam, asCanvas(canvas), scene);
        expect(canvas.tabIndex).toBe(0);
        fire(canvas, "keydown", key(code));
        tick(scene, 1);
        expect(Math.sign(cam.position[axis]), code).toBe(sign);
    }
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: tabIndex is not set when the canvas already has a tabindex attribute", () => {
    const scene = H.makeScene();
    const cam = L.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const canvas = H.makeCanvas();
    canvas.setAttribute("tabindex", "-1");
    L.attachFreeControl(cam, H.asCanvas(canvas), scene);
    expect(canvas.tabIndex).toBe(-1);
    H.fire(canvas, "keydown", H.key("KeyW"));
    H.tick(scene, 1);
    expect(cam.position.z).toBeGreaterThan(0);
});
