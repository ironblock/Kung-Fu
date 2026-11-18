// Ticket a: arc-rotate keyboard steps per branch (plain, Ctrl, Ctrl+Alt, Alt, Meta), normalisation, opt-in.
import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { asCanvas, fire, key, makeCanvas, makeScene, tick } from "./helpers";

function setup(options: Record<string, unknown> | true = true) {
    const canvas = makeCanvas();
    const scene = makeScene();
    const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    cam.inertia = 1; // offsets survive the frame, so they read back as the step added
    cam.panningInertia = 1;
    attachControl(cam, asCanvas(canvas), scene, { keyboard: options as never });
    return { canvas, scene, cam };
}
function offsets(cam: ReturnType<typeof createArcRotateCamera>) {
    return { a: cam.inertialAlphaOffset, b: cam.inertialBetaOffset, r: cam.inertialRadiusOffset, px: cam.inertialPanningX, py: cam.inertialPanningY };
}
const mods = (m: Record<string, boolean>) => ({ ctrlKey: false, altKey: false, metaKey: false, ...m });

describe("ticket a", () => {
    it("keyboard is ignored before enableArcRotateKeyboardControls (fresh module state is assumed only if first)", () => {
        // In this file the enable call happens below; this check runs first.
        const { canvas, scene, cam } = setup();
        fire(canvas, "keydown", key("ArrowRight"));
        tick(scene);
        expect(offsets(cam).a).toBe(0);
        expect(canvas.listeners.get("keydown") ?? []).toHaveLength(0);
    });

    it("plain arrows: 1/angularSensitivity, normalised by hypot, opposite keys cancel", () => {
        enableArcRotateKeyboardControls();
        let s = setup();
        fire(s.canvas, "keydown", key("ArrowRight"));
        tick(s.scene);
        expect(offsets(s.cam)).toEqual({ a: 0.01, b: 0, r: 0, px: 0, py: 0 });

        s = setup();
        fire(s.canvas, "keydown", key("ArrowRight"));
        fire(s.canvas, "keydown", key("ArrowUp"));
        tick(s.scene);
        expect(s.cam.inertialAlphaOffset).toBeCloseTo(0.01 / Math.SQRT2, 12);
        expect(s.cam.inertialBetaOffset).toBeCloseTo(-0.01 / Math.SQRT2, 12);

        s = setup({ angularSensitivity: 50 });
        fire(s.canvas, "keydown", key("ArrowDown"));
        tick(s.scene);
        expect(s.cam.inertialBetaOffset).toBeCloseTo(0.02, 12);

        s = setup();
        fire(s.canvas, "keydown", key("ArrowLeft"));
        fire(s.canvas, "keydown", key("ArrowRight"));
        tick(s.scene);
        expect(offsets(s.cam)).toEqual({ a: 0, b: 0, r: 0, px: 0, py: 0 });
    });

    it("Ctrl: 1/panningSensitivity on inertialPanningX/Y, normalised; Ctrl wins over Alt", () => {
        enableArcRotateKeyboardControls();
        for (const alt of [false, true]) {
            let s = setup();
            fire(s.canvas, "keydown", key("ArrowRight", mods({ ctrlKey: true, altKey: alt })));
            tick(s.scene);
            expect(s.cam.inertialPanningX).toBeCloseTo(0.02, 12);
            expect(s.cam.inertialPanningY).toBe(0);
            expect(s.cam.inertialAlphaOffset).toBe(0);
            expect(s.cam.inertialRadiusOffset).toBe(0);

            s = setup();
            fire(s.canvas, "keydown", key("ArrowRight", mods({ ctrlKey: true, altKey: alt })));
            fire(s.canvas, "keydown", key("ArrowUp", mods({ ctrlKey: true, altKey: alt })));
            tick(s.scene);
            expect(s.cam.inertialPanningX).toBeCloseTo(0.02 / Math.SQRT2, 12);
            expect(s.cam.inertialPanningY).toBeCloseTo(0.02 / Math.SQRT2, 12);
            expect(s.cam.inertialAlphaOffset).toBe(0);
        }
        const s = setup({ panningSensitivity: 10 });
        fire(s.canvas, "keydown", key("ArrowDown", mods({ ctrlKey: true })));
        tick(s.scene);
        expect(s.cam.inertialPanningY).toBeCloseTo(-0.1, 12);
    });

    it("Alt (no Ctrl): alpha 1/angularSensitivity and radius 1/zoomingSensitivity, not normalised", () => {
        enableArcRotateKeyboardControls();
        let s = setup();
        fire(s.canvas, "keydown", key("ArrowRight", mods({ altKey: true })));
        tick(s.scene);
        expect(s.cam.inertialAlphaOffset).toBeCloseTo(0.01, 12);
        expect(s.cam.inertialRadiusOffset).toBe(0);
        expect(s.cam.inertialBetaOffset).toBe(0);

        s = setup();
        fire(s.canvas, "keydown", key("ArrowRight", mods({ altKey: true })));
        fire(s.canvas, "keydown", key("ArrowUp", mods({ altKey: true })));
        tick(s.scene);
        expect(s.cam.inertialAlphaOffset).toBeCloseTo(0.01, 12); // full step, no hypot
        expect(s.cam.inertialRadiusOffset).toBeCloseTo(0.04, 12);
        expect(s.cam.inertialBetaOffset).toBe(0);
        expect(s.cam.inertialPanningX).toBe(0);
    });

    it("Meta held: nothing is added", () => {
        enableArcRotateKeyboardControls();
        let s = setup();
        fire(s.canvas, "keydown", key("ArrowRight"));
        fire(s.canvas, "keydown", key("MetaLeft", mods({ metaKey: true })));
        tick(s.scene);
        expect(offsets(s.cam)).toEqual({ a: 0, b: 0, r: 0, px: 0, py: 0 });
        for (const m of [{ ctrlKey: true }, { altKey: true }]) {
            s = setup();
            fire(s.canvas, "keydown", key("ArrowRight", mods({ ...m, metaKey: true })));
            tick(s.scene);
            expect(offsets(s.cam)).toEqual({ a: 0, b: 0, r: 0, px: 0, py: 0 });
        }
    });

    it("Alt Up/Down go to inertialRadiusOffset by 1/zoomingSensitivity, never beta", () => {
        enableArcRotateKeyboardControls();
        for (const [code, sign] of [["ArrowUp", 1], ["ArrowDown", -1]] as const) {
            const s = setup();
            fire(s.canvas, "keydown", key(code, mods({ altKey: true })));
            tick(s.scene);
            expect(s.cam.inertialRadiusOffset).toBeCloseTo(sign * 0.04, 12);
            expect(s.cam.inertialBetaOffset).toBe(0);
            expect(s.cam.inertialAlphaOffset).toBe(0);
        }
        const s = setup({ zoomingSensitivity: 10 });
        fire(s.canvas, "keydown", key("ArrowDown", mods({ altKey: true })));
        tick(s.scene);
        expect(s.cam.inertialRadiusOffset).toBeCloseTo(-0.1, 12);
    });

    it("an arrow whose keydown came under Meta stays void after Meta is released, until its next keydown", () => {
        enableArcRotateKeyboardControls();
        const s = setup();
        fire(s.canvas, "keydown", key("MetaLeft", mods({ metaKey: true })));
        fire(s.canvas, "keydown", key("ArrowRight", mods({ metaKey: true })));
        fire(s.canvas, "keyup", key("MetaLeft", mods({ metaKey: false })));
        tick(s.scene, 3);
        expect(offsets(s.cam)).toEqual({ a: 0, b: 0, r: 0, px: 0, py: 0 });
        fire(s.canvas, "keydown", key("ArrowRight", mods({ repeat: true } as never)));
        tick(s.scene);
        expect(s.cam.inertialAlphaOffset).toBeCloseTo(0.01, 12);
    });

    it("an arrow held before Meta counts again once Meta is released", () => {
        enableArcRotateKeyboardControls();
        const s = setup();
        fire(s.canvas, "keydown", key("ArrowRight"));
        fire(s.canvas, "keydown", key("MetaLeft", mods({ metaKey: true })));
        tick(s.scene, 2);
        expect(s.cam.inertialAlphaOffset).toBe(0);
        fire(s.canvas, "keyup", key("MetaLeft"));
        tick(s.scene);
        expect(s.cam.inertialAlphaOffset).toBeCloseTo(0.01, 12);
    });
    it("keys are heard on the canvas; tabIndex is made 0 only if the canvas has no tabindex attribute", () => {
        enableArcRotateKeyboardControls();
        const s = setup();
        expect((s.canvas.listeners.get("keydown") ?? []).length).toBeGreaterThan(0);
        expect(s.canvas.tabIndex).toBe(0);
        const canvas = makeCanvas();
        canvas.setAttribute("tabindex", "-1");
        canvas.tabIndex = -1;
        attachControl(createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 }), asCanvas(canvas), makeScene(), { keyboard: true as never });
        expect(canvas.tabIndex).toBe(-1);
    });

    it("Left+Right+Up held: the cancelled axis does not divide the step", () => {
        enableArcRotateKeyboardControls();
        const s = setup();
        fire(s.canvas, "keydown", key("ArrowLeft"));
        fire(s.canvas, "keydown", key("ArrowRight"));
        fire(s.canvas, "keydown", key("ArrowUp"));
        tick(s.scene);
        expect(s.cam.inertialAlphaOffset).toBe(0);
        expect(s.cam.inertialBetaOffset).toBeCloseTo(-0.01, 12);
    });
});
