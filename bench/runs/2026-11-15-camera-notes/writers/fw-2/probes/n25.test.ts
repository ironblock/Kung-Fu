import { describe, it, expect } from "vitest";
import { createFreeCamera, attachConfigurableFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

function setup(options?: Parameters<typeof attachConfigurableFreeControl>[3]) {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const canvas = makeCanvas();
    attachConfigurableFreeControl(cam, asCanvas(canvas), scene, options);
    return { scene, cam, canvas };
}

describe("n25 attachConfigurableFreeControl: upKeys/downKeys replace the defaults; fastKeys do nothing unless fastMultiplier is set", () => {
    it("with upKeys ['KeyE'], Space no longer moves up", () => {
        const { scene, cam, canvas } = setup({ upKeys: ["KeyE"] });
        fire(canvas, "keydown", key("Space"));
        tick(scene);
        expect(cam.position.y).toBe(0);
        fire(canvas, "keydown", key("KeyE"));
        tick(scene);
        expect(cam.position.y).toBeGreaterThan(0);
    });
    it("fastKeys without fastMultiplier move at normal speed", () => {
        const a = setup({ fastKeys: ["KeyQ"] });
        fire(a.canvas, "keydown", key("KeyQ"));
        fire(a.canvas, "keydown", key("KeyW"));
        tick(a.scene);
        const b = setup();
        fire(b.canvas, "keydown", key("KeyW"));
        tick(b.scene);
        expect(a.cam.position.z).toBeCloseTo(b.cam.position.z, 12);
        const c = setup({ fastKeys: ["KeyQ"], fastMultiplier: 3 });
        fire(c.canvas, "keydown", key("KeyQ"));
        fire(c.canvas, "keydown", key("KeyW"));
        tick(c.scene);
        expect(c.cam.position.z).toBeCloseTo(3 * b.cam.position.z, 12);
    });
});
