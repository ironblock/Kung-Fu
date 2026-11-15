import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl, disposeScene } from "@babylonjs/lite";
import { makeCanvas, asCanvas, listenerCount, makeScene } from "./helpers";

it("n42: disposeScene does not remove attachControl's canvas listeners; the returned function does", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    const detach = attachControl(cam, asCanvas(c), scene);
    const n = listenerCount(c);
    expect(n).toBeGreaterThan(0);
    disposeScene(scene);
    expect(listenerCount(c)).toBe(n);
    detach();
    expect(listenerCount(c)).toBe(0);
});
