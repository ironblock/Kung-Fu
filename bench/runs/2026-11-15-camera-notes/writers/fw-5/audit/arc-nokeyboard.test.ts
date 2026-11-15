import { describe, it, expect } from "vitest";
import { createArcRotateCamera, attachControl, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

describe("n30", () => {
    it("keyboard ignored before enable; off without keyboard option", () => {
        const c = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        const s = makeScene();
        const canvas = makeCanvas();
        attachControl(c, asCanvas(canvas), s, { keyboard: true });
        expect(canvas.listeners.get("keydown")?.length ?? 0).toBe(0);
        enableArcRotateKeyboardControls();
        fire(canvas, "keydown", key("ArrowRight"));
        tick(s, 1);
        expect(c.alpha).toBe(1); // enabling after attach does not help that attachment
        const cv2 = makeCanvas();
        attachControl(c, asCanvas(cv2), s);
        expect(cv2.listeners.get("keydown")?.length ?? 0).toBe(0);
        const cv3 = makeCanvas();
        attachControl(c, asCanvas(cv3), s, { keyboard: {} });
        expect(cv3.listeners.get("keydown")?.length).toBe(1);
        const cv4 = makeCanvas();
        attachControl(c, asCanvas(cv4), s, { keyboard: false });
        expect(cv4.listeners.get("keydown")?.length ?? 0).toBe(0);
    });
});
