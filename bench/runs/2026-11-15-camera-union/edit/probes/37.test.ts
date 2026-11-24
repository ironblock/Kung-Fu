import { it, expect } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

function moved(code: string) {
    const scene = makeScene();
    // looking along +Z and 45 degrees up
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 1 });
    const c = makeCanvas();
    attachFreeControl(cam, asCanvas(c), scene);
    fire(c, "keydown", key(code));
    tick(scene);
    return { x: cam.position.x, y: cam.position.y, z: cam.position.z, c };
}

it("37a: W/ArrowUp and S/ArrowDown move along the look direction including pitch", () => {
    for (const code of ["KeyW", "ArrowUp"]) {
        const p = moved(code);
        expect(p.y).toBeGreaterThan(0);
        expect(p.y).toBeCloseTo(p.z, 12);
        expect(p.x).toBeCloseTo(0, 12);
    }
    for (const code of ["KeyS", "ArrowDown"]) {
        const p = moved(code);
        expect(p.y).toBeLessThan(0);
        expect(p.y).toBeCloseTo(p.z, 12);
    }
});

it("37b: A/D and Left/Right move sideways; Space/PageUp straight up; Shift/PageDown straight down", () => {
    for (const code of ["KeyD", "ArrowRight"]) {
        const p = moved(code);
        expect(p.x).toBeGreaterThan(0);
        expect(p.y).toBe(0);
        expect(p.z).toBeCloseTo(0, 12);
    }
    for (const code of ["KeyA", "ArrowLeft"]) expect(moved(code).x).toBeLessThan(0);
    for (const code of ["Space", "PageUp"]) {
        const p = moved(code);
        expect(p.y).toBeGreaterThan(0);
        expect(p.x).toBe(0);
        expect(p.z).toBe(0);
    }
    for (const code of ["ShiftLeft", "ShiftRight", "PageDown"]) {
        const p = moved(code);
        expect(p.y).toBeLessThan(0);
        expect(p.z).toBe(0);
    }
});

it("37c: keys are heard on the canvas; tabIndex 0 unless it has a tabindex attribute", () => {
    const { c } = moved("KeyW");
    expect(c.tabIndex).toBe(0);
    expect(c.listeners.get("keydown")).toHaveLength(1);
    const c2 = makeCanvas();
    c2.setAttribute("tabindex", "3");
    attachFreeControl(createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }), asCanvas(c2), makeScene());
    expect(c2.tabIndex).toBe(-1);
});

import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.it("37 (after check 2): attachConfigurableFreeControl with no options has the same key map as attachFreeControl", () => {
    const codes = ["KeyW", "ArrowUp", "KeyS", "ArrowDown", "KeyA", "ArrowLeft", "KeyD", "ArrowRight", "Space", "PageUp", "ShiftLeft", "ShiftRight", "PageDown"];
    const run = (attach: typeof L2.attachFreeControl, code: string) => {
        const scene = H2.makeScene();
        const cam = L2.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 });
        const c = H2.makeCanvas();
        attach(cam, H2.asCanvas(c), scene);
        H2.fire(c, "keydown", H2.key(code));
        H2.tick(scene);
        return [cam.position.x, cam.position.y, cam.position.z];
    };
    for (const code of codes) {
        const a = run(L2.attachFreeControl, code);
        V2.expect(a.some((x) => x !== 0)).toBe(true);
        V2.expect(run(L2.attachConfigurableFreeControl, code)).toEqual(a);
    }
});
