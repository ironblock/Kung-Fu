// Ticket g: attachFreeControl drag start, continue, end, and the event fields it reads.
import { describe, expect, it } from "vitest";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import { asCanvas, fire, makeCanvas, makeScene, pointer, tick } from "./helpers";

function setup(withScene = true) {
    const canvas = makeCanvas();
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    cam.inertia = 0; // each frame applies exactly what was added since the last
    attachFreeControl(cam, asCanvas(canvas), withScene ? scene : undefined);
    return { canvas, scene, cam };
}

describe("ticket g", () => {
    it("pointerdown with button 0, 1 or 2 starts a drag, any pointerType; other buttons do not", () => {
        for (const button of [0, 1, 2]) for (const pointerType of ["mouse", "pen", "touch"]) {
            const s = setup();
            const yaw0 = s.cam._yaw, pitch0 = s.cam._pitch;
            fire(s.canvas, "pointerdown", pointer({ button, buttons: 0, pointerType, clientX: 100, clientY: 100 }));
            fire(s.canvas, "pointermove", pointer({ button: -1, buttons: 0, pointerType: "mouse", pointerId: 9, clientX: 150, clientY: 80 }));
            expect(s.cam._yaw).toBe(yaw0); // nothing until a frame runs
            tick(s.scene);
            expect(s.cam._yaw - yaw0).toBeCloseTo(50 / s.cam.angularSensitivity, 12);
            expect(s.cam._pitch - pitch0).toBeCloseTo(20 / s.cam.angularSensitivity, 12);
        }
        for (const button of [3, 4, -1]) {
            const s = setup();
            const yaw0 = s.cam._yaw;
            fire(s.canvas, "pointerdown", pointer({ button, clientX: 100 }));
            fire(s.canvas, "pointermove", pointer({ clientX: 200 }));
            tick(s.scene);
            expect(s.cam._yaw).toBe(yaw0);
        }
    });
    it("only clientX/clientY differences between moves count; movementX/Y are never read", () => {
        const s = setup();
        const yaw0 = s.cam._yaw, pitch0 = s.cam._pitch;
        fire(s.canvas, "pointermove", pointer({ clientX: 300, clientY: 300, movementX: 50 })); // no drag yet
        tick(s.scene);
        expect(s.cam._yaw).toBe(yaw0);
        fire(s.canvas, "pointerdown", pointer({ clientX: 10, clientY: 10 }));
        fire(s.canvas, "pointermove", pointer({ clientX: 10, clientY: 10, movementX: 80, movementY: 80 }));
        tick(s.scene);
        expect(s.cam._yaw).toBe(yaw0);
        expect(s.cam._pitch).toBe(pitch0);
        fire(s.canvas, "pointermove", pointer({ clientX: 30, clientY: 10, movementX: 0 }));
        fire(s.canvas, "pointermove", pointer({ clientX: 25, clientY: 10, movementX: 0 }));
        tick(s.scene);
        expect(s.cam._yaw - yaw0).toBeCloseTo(15 / s.cam.angularSensitivity, 12);
    });
    it("any pointerup ends the drag; pointercancel is not heard", () => {
        let s = setup();
        let yaw0 = s.cam._yaw;
        fire(s.canvas, "pointerdown", pointer({ button: 0, pointerId: 1, clientX: 0 }));
        fire(s.canvas, "pointerup", pointer({ button: 2, pointerId: 7, clientX: 0 }));
        fire(s.canvas, "pointermove", pointer({ clientX: 100 }));
        tick(s.scene);
        expect(s.cam._yaw).toBe(yaw0);

        s = setup();
        yaw0 = s.cam._yaw;
        expect(s.canvas.listeners.get("pointercancel") ?? []).toHaveLength(0);
        expect(s.canvas.listeners.get("pointerleave") ?? []).toHaveLength(0);
        fire(s.canvas, "pointerdown", pointer({ clientX: 0 }));
        fire(s.canvas, "pointercancel", pointer({ clientX: 0 }));
        fire(s.canvas, "pointermove", pointer({ clientX: 100 }));
        tick(s.scene);
        expect(s.cam._yaw - yaw0).toBeCloseTo(100 / s.cam.angularSensitivity, 12);
    });
    it("without a scene the drag turns nothing", () => {
        const s = setup(false);
        const yaw0 = s.cam._yaw;
        fire(s.canvas, "pointerdown", pointer({ clientX: 0 }));
        fire(s.canvas, "pointermove", pointer({ clientX: 100 }));
        tick(s.scene);
        expect(s.cam._yaw).toBe(yaw0);
    });

    it("default inertia: what a move added carries on, scaled by inertia each frame and zeroed under speed*0.001", () => {
        const canvas = makeCanvas(); const scene = makeScene();
        const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        attachFreeControl(cam, asCanvas(canvas), scene);
        expect(cam.inertia).toBe(0.9);
        const y0 = cam._yaw;
        fire(canvas, "pointerdown", pointer({ clientX: 0 }));
        fire(canvas, "pointermove", pointer({ clientX: 100 }));
        let acc = 100 / cam.angularSensitivity, want = 0;
        const steps: number[] = [];
        while (acc !== 0) {
            want += acc;
            const before = cam._yaw;
            tick(scene);
            steps.push(cam._yaw - before);
            acc *= cam.inertia;
            if (Math.abs(acc) < cam.speed * 0.001) acc = 0;
        }
        expect(steps[0]).toBeCloseTo(0.05, 12);
        expect(steps[1]).toBeCloseTo(0.045, 12);
        tick(scene, 50);
        expect(cam._yaw - y0).toBeCloseTo(want, 9);
        expect(cam._yaw - y0).toBeCloseTo(0.4809, 3);
    });
    it("clientY change goes to -_pitch, within +-(PI/2 - 0.01)", () => {
        const s = setup();
        const p0 = s.cam._pitch;
        fire(s.canvas, "pointerdown", pointer({ clientY: 0 }));
        fire(s.canvas, "pointermove", pointer({ clientY: 100 }));
        tick(s.scene);
        expect(s.cam._pitch - p0).toBeCloseTo(-100 / s.cam.angularSensitivity, 12);
        fire(s.canvas, "pointermove", pointer({ clientY: 100000 }));
        tick(s.scene);
        expect(s.cam._pitch).toBeCloseTo(-(Math.PI / 2 - 0.01), 12);
        fire(s.canvas, "pointermove", pointer({ clientY: -300000 }));
        tick(s.scene);
        expect(s.cam._pitch).toBeCloseTo(Math.PI / 2 - 0.01, 12);
    });
});
