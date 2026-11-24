import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { attachControl, createArcRotateCamera, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { asCanvas, fire, key, makeCanvas, makeScene, tick } from "./helpers";

const expected = JSON.parse(readFileSync(new URL("./C3.expected.json", import.meta.url), "utf8")) as {
    rotateFraction: number;
    altFraction: number;
    ctrlSameDistance: boolean;
};

/** Hold the given keys with the given modifiers for 60 frames; return how far alpha turned and the target moved. */
function hold(codes: string[], mods: Record<string, boolean> = {}): { dAlpha: number; dTarget: number } {
    enableArcRotateKeyboardControls();
    const cam = createArcRotateCamera(0.4, 1.0, 10, { x: 0, y: 0, z: 0 });
    const canvas = makeCanvas();
    const scene = makeScene();
    attachControl(cam, asCanvas(canvas), scene, { keyboard: true });
    for (const code of codes) {
        fire(canvas, "keydown", key(code, mods));
    }
    tick(scene, 60);
    return { dAlpha: Math.abs(cam.alpha - 0.4), dTarget: Math.hypot(cam.target.x, cam.target.y, cam.target.z) };
}

describe("C3: two arrow keys held", () => {
    it("rotateFraction", () => {
        const one = hold(["ArrowRight"]).dAlpha;
        const two = hold(["ArrowRight", "ArrowUp"]).dAlpha;
        expect(one).toBeGreaterThan(0);
        expect(Math.abs(two / one - expected.rotateFraction)).toBeLessThan(0.006);
    });

    it("altFraction", () => {
        const one = hold(["ArrowRight"], { altKey: true }).dAlpha;
        const two = hold(["ArrowRight", "ArrowUp"], { altKey: true }).dAlpha;
        expect(one).toBeGreaterThan(0);
        expect(Math.abs(two / one - expected.altFraction)).toBeLessThan(0.006);
    });

    it("ctrlSameDistance", () => {
        const one = hold(["ArrowRight"], { ctrlKey: true });
        const two = hold(["ArrowRight", "ArrowUp"], { ctrlKey: true });
        expect(one.dTarget).toBeGreaterThan(0);
        expect(one.dAlpha).toBe(0);
        expect(Math.abs(two.dTarget - one.dTarget) / one.dTarget < 1e-6).toBe(expected.ctrlSameDistance);
    });
});
