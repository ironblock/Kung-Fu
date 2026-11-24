import { describe, expect, it } from "vitest";
import { createFreeCamera } from "@babylonjs/lite";
import { attachFlyControls } from "../src/fly-controls";
import { asCanvas, fire, key, listenerCount, makeCanvas, makeScene, tick } from "./helpers";

function rig() {
    const canvas = makeCanvas();
    const scene = makeScene();
    const before = scene._beforeRender.length;
    // Level, at the origin, looking along +Z.
    const camera = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const detach = attachFlyControls(camera, asCanvas(canvas), scene);
    return { canvas, scene, camera, detach, before };
}

function hold(r: ReturnType<typeof rig>, codes: string[], frames = 10): void {
    for (const code of codes) {
        fire(r.canvas, "keydown", key(code, { shiftKey: code.startsWith("Shift") }));
    }
    tick(r.scene, frames);
}

describe("B3 fly controls", () => {
    it("moves forward three times as far with Shift held, without changing height", () => {
        const normal = rig();
        hold(normal, ["KeyW"]);
        const step = normal.camera.position.z;
        expect(step).toBeGreaterThan(0);
        expect(normal.camera.position.y).toBeCloseTo(0, 9);

        for (const shift of ["ShiftLeft", "ShiftRight"]) {
            const boosted = rig();
            hold(boosted, [shift, "KeyW"]);
            expect(boosted.camera.position.z / step).toBeCloseTo(3, 2);
            expect(boosted.camera.position.y).toBeCloseTo(0, 9);
        }
    });

    it("does not move at all when only Shift is held", () => {
        for (const shift of ["ShiftLeft", "ShiftRight"]) {
            const r = rig();
            hold(r, [shift]);
            expect(r.camera.position.x).toBeCloseTo(0, 9);
            expect(r.camera.position.y).toBeCloseTo(0, 9);
            expect(r.camera.position.z).toBeCloseTo(0, 9);
        }
    });

    it("rises on Space and sinks on PageDown", () => {
        const up = rig();
        hold(up, ["Space"]);
        expect(up.camera.position.y).toBeGreaterThan(0);

        const down = rig();
        hold(down, ["PageDown"]);
        expect(down.camera.position.y).toBeLessThan(0);
    });

    it("removes everything it added", () => {
        const r = rig();
        expect(listenerCount(r.canvas)).toBeGreaterThan(0);
        r.detach();
        expect(listenerCount(r.canvas)).toBe(0);
        expect(r.scene._beforeRender.length).toBe(r.before);
    });
});
