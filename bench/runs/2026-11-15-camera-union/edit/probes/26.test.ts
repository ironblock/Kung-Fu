import { it, expect } from "vitest";
import { createFreeCamera, attachConfigurableFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

function setup(opts: Parameters<typeof attachConfigurableFreeControl>[3]) {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const c = makeCanvas();
    attachConfigurableFreeControl(cam, asCanvas(c), scene, opts);
    return { scene, cam, c };
}

it("26a: upKeys/downKeys replace the defaults", () => {
    let { scene, cam, c } = setup({ upKeys: ["KeyE"] });
    fire(c, "keydown", key("Space"));
    tick(scene);
    expect(cam.position.y).toBe(0);
    fire(c, "keydown", key("KeyE"));
    tick(scene);
    expect(cam.position.y).toBeGreaterThan(0);
    ({ scene, cam, c } = setup({ downKeys: ["KeyQ"] }));
    fire(c, "keydown", key("ShiftLeft"));
    tick(scene);
    expect(cam.position.y).toBe(0);
});

it("26b: fastMultiplier defaults to 1, so fastKeys alone do nothing; with a multiplier the step scales while a fast key is held", () => {
    const step = (opts: Parameters<typeof attachConfigurableFreeControl>[3], fast: boolean) => {
        const { scene, cam, c } = setup(opts);
        fire(c, "keydown", key("KeyW"));
        if (fast) fire(c, "keydown", key("KeyF"));
        tick(scene);
        return cam.position.z;
    };
    const base = step({}, false);
    expect(step({ fastKeys: ["KeyF"] }, true)).toBeCloseTo(base, 12);
    expect(step({ fastKeys: ["KeyF"], fastMultiplier: 3 }, true)).toBeCloseTo(3 * base, 12);
    expect(step({ fastKeys: ["KeyF"], fastMultiplier: 3 }, false)).toBeCloseTo(base, 12);
});
