import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import { asCanvas, fire, makeCanvas, makeScene, pointer, tick } from "./helpers";

const expected = JSON.parse(readFileSync(resolve(import.meta.dirname, "F5.expected.json"), "utf8")) as Record<string, boolean>;

/** Run the given input on fresh controls and say whether the camera turned. */
function turns(input: (canvas: ReturnType<typeof makeCanvas>) => void): boolean {
    const camera = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const canvas = makeCanvas();
    const scene = makeScene();
    attachFreeControl(camera, asCanvas(canvas), scene);
    input(canvas);
    tick(scene, 60);
    const dx = camera.target.x - camera.position.x;
    const dy = camera.target.y - camera.position.y;
    return Math.abs(dx) > 1e-6 || Math.abs(dy) > 1e-6;
}

describe("pointer-lock mouse-look with attachFreeControl", () => {
    it("the controls can turn the camera at all (left drag, no lock)", () => {
        expect(turns((c) => {
            fire(c, "pointerdown", pointer({ clientX: 400, clientY: 300 }));
            fire(c, "pointermove", pointer({ clientX: 500, clientY: 340, movementX: 100, movementY: 40 }));
            fire(c, "pointerup", pointer({ clientX: 500, clientY: 340 }));
        })).toBe(true);
    });

    it("lockedNoButton", () => {
        const got = turns((c) => {
            for (let i = 0; i < 10; i++) {
                fire(c, "pointermove", pointer({ button: -1, buttons: 0, clientX: 400, clientY: 300, movementX: 20, movementY: 5 }));
            }
        });
        expect(got).toBe(expected.lockedNoButton);
    });

    it("lockedButtonHeld", () => {
        const got = turns((c) => {
            fire(c, "pointerdown", pointer({ clientX: 400, clientY: 300 }));
            for (let i = 0; i < 10; i++) {
                fire(c, "pointermove", pointer({ clientX: 400, clientY: 300, movementX: 20, movementY: 5 }));
            }
            fire(c, "pointerup", pointer({ clientX: 400, clientY: 300 }));
        });
        expect(got).toBe(expected.lockedButtonHeld);
    });

    it("rightDrag", () => {
        const got = turns((c) => {
            fire(c, "pointerdown", pointer({ button: 2, buttons: 2, clientX: 400, clientY: 300 }));
            fire(c, "pointermove", pointer({ button: -1, buttons: 2, clientX: 500, clientY: 300, movementX: 100 }));
            fire(c, "pointerup", pointer({ button: 2, buttons: 0, clientX: 500, clientY: 300 }));
        });
        expect(got).toBe(expected.rightDrag);
    });

    it("touchDrag", () => {
        const got = turns((c) => {
            fire(c, "pointerdown", pointer({ pointerType: "touch", pointerId: 7, clientX: 400, clientY: 300 }));
            fire(c, "pointermove", pointer({ pointerType: "touch", pointerId: 7, clientX: 480, clientY: 300, movementX: 80 }));
            fire(c, "pointerup", pointer({ pointerType: "touch", pointerId: 7, buttons: 0, clientX: 480, clientY: 300 }));
        });
        expect(got).toBe(expected.touchDrag);
    });
});
