import { describe, expect, it, vi } from "vitest";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

describe("n17 keyboard needs enable before attach and options.keyboard", () => {
    it("fresh module: keyboard true without enable adds no key listener", async () => {
        vi.resetModules();
        const L = await import("@babylonjs/lite");
        const c = L.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        const cv = makeCanvas();
        L.attachControl(c, asCanvas(cv), undefined, { keyboard: true });
        expect(cv.listeners.get("keydown")?.length ?? 0).toBe(0);
        // enable after attach: still no listener on that attachment
        L.enableArcRotateKeyboardControls();
        expect(cv.listeners.get("keydown")?.length ?? 0).toBe(0);
        // enabled, but keyboard omitted / false
        const cv2 = makeCanvas();
        L.attachControl(c, asCanvas(cv2));
        const cv3 = makeCanvas();
        L.attachControl(c, asCanvas(cv3), undefined, { keyboard: false });
        expect(cv2.listeners.get("keydown")?.length ?? 0).toBe(0);
        expect(cv3.listeners.get("keydown")?.length ?? 0).toBe(0);
        // enabled + object
        const cv4 = makeCanvas();
        const s = makeScene();
        L.attachControl(c, asCanvas(cv4), s, { keyboard: {} });
        expect(cv4.listeners.get("keydown")?.length).toBe(1);
        fire(cv4, "keydown", key("ArrowRight"));
        tick(s);
        expect(c.alpha).toBeGreaterThan(1);
    });
});
