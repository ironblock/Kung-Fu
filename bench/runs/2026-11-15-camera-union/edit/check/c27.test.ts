import { it, expect } from "vitest";
import { createFreeCamera, attachConfigurableFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

it("c27: in attachConfigurableFreeControl a held fast key with fastMultiplier 3 adds 3x speed*max(deltaMs,1)/sqrt(100000)", () => {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const c = makeCanvas();
    attachConfigurableFreeControl(cam, asCanvas(c), scene, { fastKeys: ["KeyF"], fastMultiplier: 3 });
    fire(c, "keydown", key("KeyW"));
    fire(c, "keydown", key("KeyF"));
    tick(scene, 1, 16);
    expect(cam.position.z).toBeCloseTo(3 * 2 * 16 / Math.sqrt(100000), 12);
});

it("c27b: the zero threshold is speed*0.001 exactly", () => {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const c = makeCanvas();
    attachConfigurableFreeControl(cam, asCanvas(c), scene);
    fire(c, "keydown", key("KeyW"));
    tick(scene, 1, 16);
    fire(c, "keyup", key("KeyW"));
    const zs: number[] = [cam.position.z];
    for (let i = 0; i < 100; i++) { tick(scene, 1, 16); zs.push(cam.position.z); }
    const steps = zs.slice(1).map((z, i) => z - zs[i]!).filter((d) => d > 0);
    const last = steps[steps.length - 1]!;
    expect(last).toBeGreaterThanOrEqual(2 * 0.001);
    expect(last * 0.9).toBeLessThan(2 * 0.001);
});
