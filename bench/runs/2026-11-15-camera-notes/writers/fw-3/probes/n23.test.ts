import { expect, test } from "vitest";
import { createFreeCamera, attachConfigurableFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

test("configurable free control: fastKeys do nothing unless fastMultiplier is set; upKeys replace Space/PageUp", () => {
    const run = (opts: object, code: string): number => {
        const scene = makeScene();
        const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const canvas = makeCanvas();
        attachConfigurableFreeControl(cam, asCanvas(canvas), scene, opts);
        fire(canvas, "keydown", key("KeyW"));
        if (code) fire(canvas, "keydown", key(code));
        tick(scene, 1);
        return cam.position.z;
    };
    const base = run({}, "");
    expect(run({ fastKeys: ["KeyF"] }, "KeyF")).toBe(base);
    expect(run({ fastKeys: ["KeyF"], fastMultiplier: 3 }, "KeyF")).toBeCloseTo(base * 3, 12);

    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const canvas = makeCanvas();
    attachConfigurableFreeControl(cam, asCanvas(canvas), scene, { upKeys: ["KeyE"] });
    fire(canvas, "keydown", key("Space"));
    tick(scene, 1);
    expect(cam.position.y).toBe(0);
    fire(canvas, "keydown", key("KeyE"));
    tick(scene, 1);
    expect(cam.position.y).toBeGreaterThan(0);
});
