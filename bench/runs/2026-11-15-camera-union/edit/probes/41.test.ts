import { it, expect } from "vitest";
import { createFreeCamera, attachFreeControl, attachConfigurableFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, pointer } from "./helpers";

for (const attach of [attachFreeControl, attachConfigurableFreeControl]) {
    it(`36: ${attach.name} with no scene never moves or turns the camera`, () => {
        const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        const c = makeCanvas();
        attach(cam, asCanvas(c));
        fire(c, "keydown", key("KeyW"));
        fire(c, "pointerdown", pointer());
        fire(c, "pointermove", pointer({ clientX: 300, clientY: 100 }));
        expect([cam.position.x, cam.position.y, cam.position.z]).toEqual([0, 0, 0]);
        expect([cam.target.x, cam.target.y, cam.target.z]).toEqual([0, 0, 1]);
        expect(cam._yaw).toBe(0);
    });
}
