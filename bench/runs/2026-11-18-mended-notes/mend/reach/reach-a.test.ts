// Reach a: Alt's vertical step goes to inertialRadiusOffset by 1/zoomingSensitivity, not beta; an arrow pressed while Meta was held stays unheld after Meta is released; no scene, nothing.
import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { asCanvas, fire, key, makeCanvas, makeScene, tick } from "./helpers";

function setup(options: Record<string, unknown> | true = true) {
    const canvas = makeCanvas();
    const scene = makeScene();
    const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    cam.inertia = 1; cam.panningInertia = 1;
    attachControl(cam, asCanvas(canvas), scene, { keyboard: options as never });
    return { canvas, scene, cam };
}
describe("reach a", () => {
    it("Alt+ArrowUp adds 1/zoomingSensitivity (default 25) to inertialRadiusOffset, beta untouched", () => {
        enableArcRotateKeyboardControls();
        let s = setup();
        fire(s.canvas, "keydown", key("ArrowUp", { altKey: true }));
        tick(s.scene);
        expect(s.cam.inertialBetaOffset).toBe(0);
        expect(s.cam.inertialRadiusOffset).toBeCloseTo(0.04, 12);
        s = setup({ zoomingSensitivity: 10 });
        fire(s.canvas, "keydown", key("ArrowDown", { altKey: true }));
        tick(s.scene);
        expect(s.cam.inertialRadiusOffset).toBeCloseTo(-0.1, 12);
    });
    it("an arrow pressed while Meta is held adds nothing after Meta is released", () => {
        enableArcRotateKeyboardControls();
        const s = setup();
        fire(s.canvas, "keydown", key("MetaLeft", { metaKey: true }));
        fire(s.canvas, "keydown", key("ArrowRight", { metaKey: true }));
        fire(s.canvas, "keyup", key("MetaLeft", { metaKey: false }));
        tick(s.scene, 3);
        expect(s.cam.inertialAlphaOffset).toBe(0);
    });
    it("without a scene held keys add nothing", () => {
        enableArcRotateKeyboardControls();
        const canvas = makeCanvas();
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        attachControl(cam, asCanvas(canvas), undefined as never, { keyboard: true });
        fire(canvas, "keydown", key("ArrowRight"));
        expect(cam.inertialAlphaOffset).toBe(0);
    });
});
