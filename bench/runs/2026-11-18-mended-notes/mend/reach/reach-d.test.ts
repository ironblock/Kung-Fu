// Reach d: after camera.limits = newObject, attachGeospatialControls' zoom clamps by the NEW object.
import { describe, expect, it } from "vitest";
import { attachGeospatialControls, createGeospatialCamera } from "@babylonjs/lite";
import { asCanvas, fire, makeCanvas, makeScene, tick } from "./helpers";

const R = 1000;
(globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {} };
function run(replace: boolean) {
    const cam = createGeospatialCamera({ planetRadius: R });
    if (replace) cam.limits = { ...cam.limits, radiusMin: 3990 };
    const canvas = makeCanvas();
    const scene = makeScene();
    attachGeospatialControls(cam, asCanvas(canvas), scene);
    for (let i = 0; i < 40; i++) {
        fire(canvas, "wheel", { deltaY: -100, clientX: 400, clientY: 300 });
        tick(scene);
    }
    tick(scene, 60);
    return cam.radius;
}
describe("reach d", () => {
    it("wheel zoom-in stops at the new object's radiusMin", () => {
        const orig = run(false);
        const repl = run(true);
        console.log("radius original", orig, "replaced", repl);
        expect(orig).toBeLessThan(3990);
        expect(repl).toBeGreaterThanOrEqual(3990 - 1e-6);
    });
});
