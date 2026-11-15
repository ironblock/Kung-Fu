import { it, expect } from "vitest";
import { createFreeCamera, attachConfigurableFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

function moved(options: Parameters<typeof attachConfigurableFreeControl>[3], codes: string[]) {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    cam.inertia = 0;
    const c = makeCanvas();
    attachConfigurableFreeControl(cam, asCanvas(c), scene, options);
    for (const code of codes) fire(c, "keydown", key(code));
    tick(scene);
    return { x: cam.position.x, y: cam.position.y, z: cam.position.z };
}

it("n23: fastKeys do nothing unless fastMultiplier is set; upKeys replace the defaults", () => {
    const base = moved({}, ["KeyW"]).z;
    expect(moved({ fastKeys: ["KeyF"] }, ["KeyW", "KeyF"]).z).toBeCloseTo(base, 10);
    expect(moved({ fastKeys: ["KeyF"], fastMultiplier: 3 }, ["KeyW", "KeyF"]).z).toBeCloseTo(3 * base, 10);
    expect(moved({ upKeys: ["KeyE"] }, ["Space"]).y).toBe(0);
    expect(moved({ upKeys: ["KeyE"] }, ["KeyE"]).y).toBeGreaterThan(0);
});
