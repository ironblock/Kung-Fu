import { expect, it } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import { attachLimitedOrbit } from "../src/limited-orbit";
import { asCanvas, fire, makeCanvas, makeScene, tick, touches } from "./helpers";

// Real state: the camera's own radius getter and worldMatrix getter, kept before the call. The eye's distance
// from the target is what the picture shows. The world matrix is read every frame, as a renderer does.
function setup(radius: number) {
    const canvas = makeCanvas();
    const scene = makeScene();
    const camera = createArcRotateCamera(0, 1, radius, { x: 0, y: 0, z: 0 });
    const ownR = Object.getOwnPropertyDescriptor(camera, "radius")!.get!;
    const ownWm = Object.getOwnPropertyDescriptor(camera, "worldMatrix")!.get!;
    const eyeDist = (): number => { const m = ownWm.call(camera); return Math.hypot(m[12]! - camera.target.x, m[13]! - camera.target.y, m[14]! - camera.target.z); };
    eyeDist();
    attachLimitedOrbit(camera, asCanvas(canvas), scene, 2, 6);
    const realR = (): number => ownR.call(camera);
    return { canvas, scene, camera, eyeDist, realR };
}

it("B1 starts too far: real radius and eye in range at once", () => {
    const { camera, eyeDist, realR } = setup(10);
    console.log("PROBE start10 camera.radius", camera.radius.toFixed(3), "real", realR().toFixed(3), "eye", eyeDist().toFixed(3));
    expect(eyeDist()).toBeLessThanOrEqual(6 + 1e-6);
    expect(realR()).toBeLessThanOrEqual(6 + 1e-6);
});

it("B1 wheel out: eye moves out and stays in range every frame", () => {
    const { canvas, scene, camera, eyeDist, realR } = setup(5);
    fire(canvas, "wheel", { deltaY: 5000, deltaX: 0, deltaMode: 0 });
    let max = eyeDist();
    for (let i = 0; i < 60; i++) { tick(scene); max = Math.max(max, eyeDist()); }
    console.log("PROBE wheelout camera.radius", camera.radius.toFixed(3), "real", realR().toFixed(3), "eye", eyeDist().toFixed(3), "max eye", max.toFixed(3));
    expect(eyeDist()).toBeGreaterThan(5.01);
    expect(max).toBeLessThanOrEqual(6 + 1e-6);
    expect(eyeDist()).toBeCloseTo(camera.radius, 4);
});

it("B1 pinch in: eye moves in and stays in range", () => {
    const { canvas, scene, camera, eyeDist, realR } = setup(5);
    fire(canvas, "touchstart", touches([1, 100, 100], [2, 300, 100]));
    fire(canvas, "touchmove", touches([1, 0, 100], [2, 2000, 100]));
    tick(scene);
    console.log("PROBE pinch camera.radius", camera.radius.toFixed(3), "real", realR().toFixed(3), "eye", eyeDist().toFixed(3));
    expect(eyeDist()).toBeLessThan(4.99);
    expect(eyeDist()).toBeGreaterThanOrEqual(2 - 1e-6);
});
