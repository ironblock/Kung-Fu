import { describe, it, expect } from "vitest";
import { createArcRotateCamera, attachControl, disposeScene } from "@babylonjs/lite";
import { makeCanvas, asCanvas, makeScene, listenerCount } from "./helpers";

describe("n31 disposeScene does not remove attachControl's canvas listeners", () => {
    it("listeners stay on the canvas after disposeScene; the returned function removes them", () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        const detach = attachControl(cam, asCanvas(canvas), scene);
        const n = listenerCount(canvas);
        expect(n).toBeGreaterThan(0);
        disposeScene(scene);
        expect(listenerCount(canvas)).toBe(n);
        detach();
        expect(listenerCount(canvas)).toBe(0);
    });
});
