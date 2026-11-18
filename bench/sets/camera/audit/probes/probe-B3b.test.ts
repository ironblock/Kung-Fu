import { expect, it } from "vitest";
import { createFreeCamera } from "@babylonjs/lite";
import { attachFlyControls } from "../src/fly-controls";
import { asCanvas, fire, key, makeCanvas, makeScene, tick } from "./helpers";

it("B3 Space: the position's own y and the eye agree", () => {
    const canvas = makeCanvas();
    const scene = makeScene();
    const camera = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const ownWm = Object.getOwnPropertyDescriptor(camera, "worldMatrix")!.get!;
    ownWm.call(camera);
    attachFlyControls(camera, asCanvas(canvas), scene);
    fire(canvas, "keydown", key("Space"));
    for (let i = 0; i < 10; i++) { tick(scene); ownWm.call(camera); }
    const m = ownWm.call(camera);
    const own = (camera.position as unknown as { _y: number })._y;
    console.log("PROBE space eye y", m[13]!.toFixed(4), "own _y", own.toFixed(4), "camera.position.y", camera.position.y.toFixed(4), "own accessor on position", Object.getOwnPropertyNames(camera.position).join(","));
    expect(m[13]).toBeGreaterThan(0);
    expect(own).toBeCloseTo(m[13]!, 5);
});
