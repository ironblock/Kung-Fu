import { expect, it } from "vitest";
import { attachControl, createArcRotateCamera, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { asCanvas, fire, key, makeCanvas, makeScene, tick } from "./helpers";
import { createOrbitCamera } from "../src/orbit-camera";

// 1. Is the library's own keyboard module on after createOrbitCamera? A second camera asks for { keyboard: true }.
// 2. Does the answer's camera respond to arrow keys, with modifiers, as the library's keyboard control does?
// The turn is read through the camera's own alpha/beta/radius getters and target, kept after creation.
it("K1 the library's arrow-key control is on after the call", () => {
    createOrbitCamera(asCanvas(makeCanvas()), makeScene());
    const canvas = makeCanvas(), scene = makeScene();
    const other = createArcRotateCamera(Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });
    attachControl(other, asCanvas(canvas), scene, { keyboard: true });
    const before = other.alpha;
    fire(canvas, "keydown", key("ArrowLeft"));
    tick(scene, 3);
    fire(canvas, "keyup", key("ArrowLeft"));
    console.log(`PROBE module-on: second camera alpha moved by ${(other.alpha - before).toFixed(5)}`);
    expect(other.alpha).not.toBe(before);
});

it("K1 arrow keys, with and without modifiers, turn the camera as the library's keyboard control does", () => {
    const c1 = makeCanvas(), s1 = makeScene();
    const cam = createOrbitCamera(asCanvas(c1), s1);
    enableArcRotateKeyboardControls();
    const c2 = makeCanvas(), s2 = makeScene();
    const lib = createArcRotateCamera(cam.alpha, cam.beta, cam.radius, { x: 0, y: 0, z: 0 });
    attachControl(lib, asCanvas(c2), s2, { keyboard: true });
    const pose = (c: typeof cam) => {
        const g = (k: string) => Object.getOwnPropertyDescriptor(c, k)!.get!.call(c) as number;
        return [g("alpha"), g("beta"), g("radius"), c.target.x, c.target.y, c.target.z];
    };
    let bad = 0;
    for (const [code, mods] of [["ArrowLeft", {}], ["ArrowLeft", { ctrlKey: true }], ["ArrowUp", { altKey: true }]] as const) {
        for (const [c, s] of [[c1, s1], [c2, s2]] as const) {
            fire(c, "keydown", key(code, mods));
            tick(s, 10);
            fire(c, "keyup", key(code, mods));
            tick(s, 100);
        }
        const a = pose(cam), b = pose(lib);
        const off = Math.max(...a.map((v, i) => Math.abs(v - b[i]!)));
        if (off > 1e-4) bad++;
        console.log(`PROBE ${code}${JSON.stringify(mods)} answer ${a.map((v) => v.toFixed(4)).join(",")} lib ${b.map((v) => v.toFixed(4)).join(",")} off ${off.toFixed(4)}`);
    }
    expect(bad).toBe(0);
});
