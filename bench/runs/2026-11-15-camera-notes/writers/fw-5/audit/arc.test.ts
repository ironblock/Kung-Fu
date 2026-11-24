import { describe, it, expect } from "vitest";
import {
    createArcRotateCamera,
    attachControl,
    setCameraLimits,
    enableArcRotateKeyboardControls,
    interpolateArcRotateCamera,
    disposeScene,
    onSceneDispose,
} from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, touches, key, makeScene, tick, listenerCount } from "./helpers";

const cam = () => createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });

describe("n01", () => {
    it("hand-written limits clamp nothing in setters or attachControl", () => {
        const c = cam();
        c.lowerRadiusLimit = 5;
        c.upperBetaLimit = 1.2;
        c.radius = 2;
        c.beta = 2;
        expect(c.radius).toBe(2);
        expect(c.beta).toBe(2);
        const s = makeScene();
        const canvas = makeCanvas();
        attachControl(c, asCanvas(canvas), s);
        c.inertialRadiusOffset = 1;
        tick(s, 3);
        expect(c.radius).toBeLessThan(2);
    });
    it("but interpolateArcRotateCamera does clamp its goal to hand-written limit fields", async () => {
        const c = cam();
        c.lowerRadiusLimit = 5;
        const s = makeScene();
        const p = interpolateArcRotateCamera(c, s, { radius: 1 });
        tick(s, 400);
        await p;
        expect(c.radius).toBe(5); // clamped by a hand-written field, no setCameraLimits
    });
});

describe("n02", () => {
    it("clamps at once with inertia zeroed, then on writes; hand field change applied at next write", () => {
        const c = cam();
        c.inertialRadiusOffset = 3;
        setCameraLimits(c, { upperRadiusLimit: 8 });
        expect(c.radius).toBe(8);
        expect(c.inertialRadiusOffset).toBe(0);
        c.radius = 20;
        expect(c.radius).toBe(8);
        c.upperRadiusLimit = 6;
        expect(c.radius).toBe(8);
        c.alpha = 2;
        expect(c.radius).toBe(6);
    });
    it("a write of the unchanged value does not apply a hand-changed limit", () => {
        const c = cam();
        setCameraLimits(c, { upperRadiusLimit: 20 });
        c.upperRadiusLimit = 6;
        c.radius = 10; // same value: a write, but no clamp
        expect(c.radius).toBe(10);
    });
});

describe("n03", () => {
    it("beta clamped only on rotation frames, radius floor on zoom, direct writes never", () => {
        const c = cam();
        const s = makeScene();
        attachControl(c, asCanvas(makeCanvas()), s);
        c.beta = 4;
        c.radius = -1;
        tick(s, 2);
        expect(c.beta).toBe(4);
        expect(c.radius).toBe(-1);
        c.inertialAlphaOffset = 0.1;
        tick(s, 1);
        expect(c.beta).toBeCloseTo(Math.PI - 0.01);
        c.inertialRadiusOffset = 0.5;
        tick(s, 1);
        expect(c.radius).toBe(0.01);
    });
});

describe("n04", () => {
    it("arc defaults", () => {
        const c = cam();
        expect([c.nearPlane, c.farPlane, c.fov]).toEqual([0.1, 1000, 0.8]);
    });
});

describe("n06", () => {
    it("target.x marks dirty; whole replacement is not seen until alpha/beta/radius change", () => {
        const c = cam();
        const v0 = c.worldMatrixVersion;
        c.target.x = 1;
        expect(c.worldMatrixVersion).not.toBe(v0);
        const before = [...c.worldMatrix];
        c.target = { x: 5, y: 5, z: 5 };
        expect([...c.worldMatrix]).toEqual(before);
        c.target.x = 7;
        expect([...c.worldMatrix]).toEqual(before);
        c.alpha = 1.5;
        expect(c.worldMatrix[12]).toBeCloseTo(7 + 10 * Math.cos(1.5) * Math.sin(1));
    });
});

describe("n23", () => {
    it("without scene drag/wheel fill offsets, nothing moves; pinch writes radius", () => {
        enableArcRotateKeyboardControls();
        const c = cam();
        const canvas = makeCanvas();
        attachControl(c, asCanvas(canvas), undefined, { keyboard: true });
        fire(canvas, "pointerdown", pointer({ clientX: 0, clientY: 0 }));
        fire(canvas, "pointermove", pointer({ clientX: 50, clientY: 20 }));
        fire(canvas, "wheel", { deltaY: 100 });
        expect(c.inertialAlphaOffset).not.toBe(0);
        expect(c.inertialRadiusOffset).not.toBe(0);
        expect([c.alpha, c.beta, c.radius]).toEqual([1, 1, 10]);
        // keyboard: offsets are filled only by the per-frame hook, so without a scene nothing is filled
        const c2 = cam();
        const cv2 = makeCanvas();
        attachControl(c2, asCanvas(cv2), undefined, { keyboard: true });
        fire(cv2, "keydown", key("ArrowRight"));
        expect(c2.inertialAlphaOffset).toBe(0);
        // pinch
        fire(canvas, "touchstart", touches([1, 0, 0], [2, 100, 0]));
        fire(canvas, "touchmove", touches([2, 200, 0]));
        expect(c.radius).toBeCloseTo(5);
    });
});

describe("n26", () => {
    it("wheel formula", () => {
        const c = cam();
        c.inertia = 0;
        const s = makeScene();
        const canvas = makeCanvas();
        attachControl(c, asCanvas(canvas), s);
        fire(canvas, "wheel", { deltaY: 30 });
        expect(c.inertialRadiusOffset).toBeCloseTo(-30 * 10 / 3000);
        tick(s, 1);
        expect(c.radius).toBeCloseTo(10.1);
    });
});

describe("n27", () => {
    it("pan formula along right/up", () => {
        const c = createArcRotateCamera(0, Math.PI / 2, 100, { x: 0, y: 0, z: 0 });
        c.panningInertia = 0;
        const s = makeScene();
        const canvas = makeCanvas();
        attachControl(c, asCanvas(canvas), s);
        fire(canvas, "pointerdown", pointer({ button: 2, clientX: 0, clientY: 0 }));
        fire(canvas, "pointermove", pointer({ button: 2, clientX: 10, clientY: 5 }));
        expect(c.inertialPanningX).toBeCloseTo(-10 / 50);
        expect(c.inertialPanningY).toBeCloseTo(5 / 50);
        tick(s, 1);
        // alpha 0: right = (0,0,1), up = (0,1,0) at beta pi/2
        expect(c.target.z).toBeCloseTo(-0.2 * 0.1);
        expect(c.target.y).toBeCloseTo(0.1 * 0.1);
    });
});

describe("n28", () => {
    it("button mapping, middle does nothing, touch always rotates", () => {
        const c = cam();
        const canvas = makeCanvas();
        attachControl(c, asCanvas(canvas), undefined, { pointerMappings: { primaryButton: "pan", secondaryButton: "rotate" } });
        fire(canvas, "pointerdown", pointer({ button: 1 }));
        fire(canvas, "pointermove", pointer({ clientX: 10 }));
        expect([c.inertialAlphaOffset, c.inertialPanningX]).toEqual([0, 0]);
        fire(canvas, "pointerup", pointer());
        fire(canvas, "pointerdown", pointer({ button: 0, pointerType: "touch", clientX: 0 }));
        fire(canvas, "pointermove", pointer({ clientX: 10, pointerType: "touch" }));
        expect(c.inertialAlphaOffset).not.toBe(0);
        expect(c.inertialPanningX).toBe(0);
        fire(canvas, "pointerup", pointer());
        fire(canvas, "pointerdown", pointer({ button: 0, pointerType: "pen", clientX: 0 }));
        fire(canvas, "pointermove", pointer({ clientX: 10, pointerType: "pen" }));
        expect(c.inertialPanningX).not.toBe(0);
    });
});

describe("n29", () => {
    it("pinch formula, limits and floor", () => {
        const c = cam();
        const canvas = makeCanvas();
        attachControl(c, asCanvas(canvas));
        fire(canvas, "touchstart", touches([1, 0, 0], [2, 100, 0]));
        fire(canvas, "touchmove", touches([2, 400, 0]));
        expect(c.radius).toBeCloseTo(2.5);
        expect(c.inertialRadiusOffset).toBe(0);
        setCameraLimits(c, { lowerRadiusLimit: 2 });
        fire(canvas, "touchmove", touches([2, 1000, 0]));
        expect(c.radius).toBe(2);
        const c2 = cam();
        const cv2 = makeCanvas();
        attachControl(c2, asCanvas(cv2));
        fire(cv2, "touchstart", touches([1, 0, 0], [2, 1, 0]));
        fire(cv2, "touchmove", touches([2, 100000, 0]));
        expect(c2.radius).toBe(0.01);
    });
});

describe("n31", () => {
    function setup() {
        enableArcRotateKeyboardControls();
        const c = cam();
        const s = makeScene();
        const canvas = makeCanvas();
        attachControl(c, asCanvas(canvas), s, { keyboard: true });
        c.inertia = 0;
        c.panningInertia = 0;
        return { c, s, canvas };
    }
    it("defaults", () => {
        let { c, s, canvas } = setup();
        fire(canvas, "keydown", key("ArrowRight"));
        fire(canvas, "keydown", key("ArrowUp"));
        tick(s, 1);
        expect(c.alpha - 1).toBeCloseTo(0.01 / Math.SQRT2);
        expect(c.beta - 1).toBeCloseTo(-0.01 / Math.SQRT2);
        ({ c, s, canvas } = setup());
        fire(canvas, "keydown", key("ArrowRight", { ctrlKey: true }));
        tick(s, 1);
        expect(c.alpha).toBe(1);
        expect(c.target.x !== 0 || c.target.z !== 0).toBe(true);
        ({ c, s, canvas } = setup());
        fire(canvas, "keydown", key("ArrowUp", { altKey: true }));
        tick(s, 1);
        expect(c.radius).toBeCloseTo(10 - 1 / 25);
        ({ c, s, canvas } = setup());
        fire(canvas, "keydown", key("ArrowLeft", { altKey: true }));
        tick(s, 1);
        expect(c.alpha).toBeCloseTo(1 - 0.01);
        ({ c, s, canvas } = setup());
        fire(canvas, "keydown", key("ArrowUp", { altKey: true, ctrlKey: true }));
        tick(s, 1);
        expect(c.radius).toBe(10);
        ({ c, s, canvas } = setup());
        fire(canvas, "keydown", key("ArrowUp"));
        fire(canvas, "keydown", key("MetaLeft", { metaKey: true }));
        tick(s, 1);
        expect([c.alpha, c.beta, c.radius]).toEqual([1, 1, 10]);
    });
});

describe("n32", () => {
    it("canvas listeners, tabIndex, blur, custom keys replace", () => {
        enableArcRotateKeyboardControls();
        const c = cam();
        c.inertia = 0;
        const s = makeScene();
        const canvas = makeCanvas();
        attachControl(c, asCanvas(canvas), s, { keyboard: { keys: { right: ["KeyD"] } } });
        expect(canvas.tabIndex).toBe(0);
        expect(canvas.listeners.get("keydown")?.length).toBe(1);
        fire(canvas, "keydown", key("ArrowRight"));
        tick(s, 1);
        expect(c.alpha).toBe(1);
        fire(canvas, "keydown", key("KeyD"));
        fire(canvas, "blur");
        tick(s, 1);
        expect(c.alpha).toBe(1);
        fire(canvas, "keydown", key("KeyD"));
        tick(s, 1);
        expect(c.alpha).toBeCloseTo(1.01);
    });
});

describe("n25", () => {
    it("disposeScene leaves listeners; onSceneDispose; cleanup twice ok", () => {
        const c = cam();
        const s = makeScene();
        const canvas = makeCanvas();
        const off = attachControl(c, asCanvas(canvas), s);
        const n = listenerCount(canvas);
        disposeScene(s);
        expect(listenerCount(canvas)).toBe(n);
        off();
        off();
        expect(listenerCount(canvas)).toBe(0);
        const s2 = makeScene();
        onSceneDispose(s2, attachControl(c, asCanvas(canvas), s2));
        disposeScene(s2);
        expect(listenerCount(canvas)).toBe(0);
    });
});

describe("n56", () => {
    it("options hooks", () => {
        const c = cam();
        const canvas = makeCanvas();
        let ext = false;
        let pend = false;
        attachControl(c, asCanvas(canvas), undefined, {
            shouldHandlePointerDown: (e) => (e as unknown as { clientX: number }).clientX !== 99,
            isExternalDragActive: () => ext,
            isExternalPickPending: () => pend,
        });
        fire(canvas, "pointerdown", pointer({ clientX: 99 }));
        fire(canvas, "pointermove", pointer({ clientX: 120 }));
        expect(c.inertialAlphaOffset).toBe(0);
        expect(canvas.captured.length).toBe(0);
        fire(canvas, "pointerdown", pointer({ clientX: 0 }));
        pend = true;
        fire(canvas, "pointermove", pointer({ clientX: 10 }));
        expect(c.inertialAlphaOffset).toBe(0);
        pend = false;
        fire(canvas, "pointermove", pointer({ clientX: 20 }));
        expect(c.inertialAlphaOffset).toBeCloseTo(-0.01);
        c.inertialRadiusOffset = 0.3;
        ext = true;
        fire(canvas, "pointermove", pointer({ clientX: 30 }));
        expect(c.inertialAlphaOffset).toBe(0);
        expect(c.inertialRadiusOffset).toBe(0.3);
        ext = false;
        fire(canvas, "pointermove", pointer({ clientX: 40 }));
        expect(c.inertialAlphaOffset).toBe(0); // drag ended
    });
});

describe("n57", () => {
    it("merge, undefined clears, disposer leaves values", () => {
        const c = cam();
        setCameraLimits(c, { lowerRadiusLimit: 2, upperRadiusLimit: 20 });
        setCameraLimits(c, { upperRadiusLimit: undefined });
        expect(c.lowerRadiusLimit).toBe(2);
        expect("upperRadiusLimit" in c && c.upperRadiusLimit === undefined).toBe(true);
        c.radius = 50;
        expect(c.radius).toBe(50);
        const off = setCameraLimits(c, {});
        off();
        expect(c.lowerRadiusLimit).toBe(2);
        c.radius = 1;
        expect(c.radius).toBe(1);
    });
});

describe("n33-n36 interpolation", () => {
    it("n33 rejects with message on outside change; newer interpolation", async () => {
        const c = cam();
        const s = makeScene();
        const p = interpolateArcRotateCamera(c, s, { radius: 2 });
        tick(s, 1);
        c.alpha = 0.3;
        tick(s, 1);
        await expect(p).rejects.toThrow("ArcRotate camera interpolation was interrupted.");
        const p1 = interpolateArcRotateCamera(c, s, { radius: 4 });
        tick(s, 1);
        const p2 = interpolateArcRotateCamera(c, s, { radius: 8 });
        tick(s, 2);
        await expect(p1).rejects.toThrow("interrupted");
        tick(s, 400);
        await p2;
        // attachControl inertia
        const c3 = cam();
        const s3 = makeScene();
        const canvas = makeCanvas();
        attachControl(c3, asCanvas(canvas), s3);
        const p3 = interpolateArcRotateCamera(c3, s3, { radius: 2 });
        tick(s3, 1);
        fire(canvas, "wheel", { deltaY: 100 });
        tick(s3, 2);
        await expect(p3).rejects.toThrow("interrupted");
    });
    it("n34 first-frame read, inertia zeroed on first frame, half-life", async () => {
        const c = cam();
        const s = makeScene();
        c.inertialAlphaOffset = 0.5;
        const p = interpolateArcRotateCamera(c, s, { radius: 20 });
        expect(c.inertialAlphaOffset).toBe(0.5);
        c.alpha = 2; // omitted field, read on first frame
        tick(s, 1, 100);
        expect(c.inertialAlphaOffset).toBe(0);
        expect(c.alpha).toBe(2);
        expect(c.radius).toBeCloseTo(10 + 10 * 0.5); // dt = factor -> half the gap
        tick(s, 300);
        await p;
        expect(c.alpha).toBe(2);
    });
    it("n35 shortest arc for alpha and beta, exact snap", async () => {
        const c = createArcRotateCamera(0.1, 0.2, 10, { x: 0, y: 0, z: 0 });
        const s = makeScene();
        const p = interpolateArcRotateCamera(c, s, { alpha: 2 * Math.PI - 0.1, beta: 2 * Math.PI });
        tick(s, 1);
        expect(c.alpha).toBeLessThan(0.1);
        expect(c.beta).toBeLessThan(0.2);
        tick(s, 500);
        await p;
        expect(c.alpha).toBe(2 * Math.PI - 0.1);
        expect(c.beta).toBe(2 * Math.PI);
    });
    it("n36 goals clamped to limit fields each frame; target not", async () => {
        const c = cam();
        setCameraLimits(c, { upperRadiusLimit: 15, upperBetaLimit: 1.5 });
        const s = makeScene();
        const p = interpolateArcRotateCamera(c, s, { radius: 100, beta: 3, target: { x: 50, y: 0, z: 0 } });
        tick(s, 500);
        await p;
        expect(c.radius).toBe(15);
        expect(c.beta).toBe(1.5);
        expect(c.target.x).toBe(50);
    });
});
