import { describe, expect, it } from "vitest";
import {
    createArcRotateCamera,
    attachControl,
    setCameraLimits,
    interpolateArcRotateCamera,
    enableArcRotateKeyboardControls,
    getViewMatrix,
    disposeScene,
    onSceneDispose,
} from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, touches, key, makeScene, tick, listenerCount } from "./helpers";

const flush = () => new Promise((r) => setTimeout(r, 0));
const cam = () => createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
function track(p: Promise<void>) {
    const s = { state: "pending" as string, err: undefined as unknown };
    p.then(
        () => (s.state = "resolved"),
        (e) => {
            s.state = "rejected";
            s.err = e;
        }
    );
    return s;
}

describe("n01 arc defaults", () => {
    it("defaults", () => {
        const c = cam();
        expect([c.fov, c.nearPlane, c.farPlane, c.inertia, c.panningInertia, c.angularSensibility, c.panningSensibility, c.wheelPrecision]).toEqual([
            0.8, 0.1, 1000, 0.9, 0.9, 1000, 50, 3,
        ]);
        expect([c.lowerAlphaLimit, c.upperAlphaLimit, c.lowerBetaLimit, c.upperBetaLimit, c.lowerRadiusLimit, c.upperRadiusLimit]).toEqual([
            undefined, undefined, undefined, undefined, undefined, undefined,
        ]);
    });
});

describe("n03 attachControl without scene", () => {
    it("drag and wheel without scene move nothing; with scene they do", () => {
        const c = cam();
        const cv = makeCanvas();
        attachControl(c, asCanvas(cv));
        fire(cv, "pointerdown", pointer({ clientX: 0, clientY: 0 }));
        fire(cv, "pointermove", pointer({ clientX: 50, clientY: 30 }));
        fire(cv, "pointerup", pointer());
        fire(cv, "wheel", { deltaY: 100 });
        expect([c.alpha, c.beta, c.radius]).toEqual([1, 1, 10]);
        expect(c.inertialAlphaOffset).not.toBe(0);
        const s = makeScene();
        const c2 = cam();
        const cv2 = makeCanvas();
        attachControl(c2, asCanvas(cv2), s);
        fire(cv2, "pointerdown", pointer());
        fire(cv2, "pointermove", pointer({ clientX: 50 }));
        tick(s);
        expect(c2.alpha).not.toBe(1);
    });
    it("pinch writes radius without scene", () => {
        const c = cam();
        const cv = makeCanvas();
        attachControl(c, asCanvas(cv));
        fire(cv, "touchstart", touches([1, 0, 0], [2, 100, 0]));
        fire(cv, "touchmove", touches([2, 200, 0]));
        expect(c.radius).toBeCloseTo(5);
    });
    it("keys without scene do nothing", () => {
        enableArcRotateKeyboardControls();
        const c = cam();
        const cv = makeCanvas();
        attachControl(c, asCanvas(cv), undefined, { keyboard: true });
        fire(cv, "keydown", key("ArrowRight"));
        expect(c.alpha).toBe(1);
    });
});

describe("n05 target", () => {
    it("writing target.x moves view; assigning new object does not until alpha changes", () => {
        const c = cam();
        const v0 = Array.from(getViewMatrix(c));
        c.target.x = 5;
        const v1 = Array.from(getViewMatrix(c));
        expect(v1).not.toEqual(v0);
        c.target = { x: 100, y: 0, z: 0 };
        const v2 = Array.from(getViewMatrix(c));
        expect(v2).toEqual(v1);
        c.alpha = 1.0001;
        const v3 = Array.from(getViewMatrix(c));
        expect(v3[12]).not.toBeCloseTo(v1[12]!, 1);
    });
});

describe("n06 direct limit fields", () => {
    it("writing a limit directly clamps nothing (plain case), even with attachControl ticking", () => {
        const c = cam();
        const s = makeScene();
        const cv = makeCanvas();
        attachControl(c, asCanvas(cv), s);
        c.lowerBetaLimit = 0.9;
        c.upperRadiusLimit = 5;
        c.beta = 0.5;
        c.inertialRadiusOffset = -1;
        tick(s, 3);
        expect(c.beta).toBe(0.5);
        expect(c.radius).toBeGreaterThan(10);
    });
    it("after setCameraLimits, a directly written limit field clamps the next setter write", () => {
        const c = cam();
        setCameraLimits(c, { lowerRadiusLimit: 1 });
        c.upperRadiusLimit = 5;
        c.radius = 20;
        expect(c.radius).toBe(20); // note's claim: direct write clamps nothing
    });
    it("interpolateArcRotateCamera clamps to directly written limit fields", async () => {
        const c = cam();
        const s = makeScene();
        c.upperRadiusLimit = 5;
        const st = track(interpolateArcRotateCamera(c, s, { radius: 20 }, undefined, { interpolationFactor: 0 }));
        tick(s, 2);
        await flush();
        expect(st.state).toBe("resolved");
        expect(c.radius).toBe(20); // note: only setCameraLimits clamps
    });
});

describe("n07 setCameraLimits", () => {
    it("clamps own writes, zeroes offset at bound, disposer stops clamp but leaves fields", () => {
        const c = cam();
        const off = setCameraLimits(c, { lowerRadiusLimit: 2, upperRadiusLimit: 20, upperBetaLimit: 1.2 });
        c.inertialRadiusOffset = 3;
        c.radius = 50;
        expect(c.radius).toBe(20);
        expect(c.inertialRadiusOffset).toBe(0);
        c.inertialBetaOffset = 0.5;
        c.beta = 2;
        expect(c.beta).toBe(1.2);
        expect(c.inertialBetaOffset).toBe(0);
        off();
        c.radius = 50;
        expect(c.radius).toBe(50);
        expect(c.upperRadiusLimit).toBe(20);
    });
});

describe("n08 setCameraLimits merge", () => {
    it("merges, undefined clears, scene ignored", () => {
        const c = cam();
        setCameraLimits(c, { lowerRadiusLimit: 2 });
        setCameraLimits(c, { upperRadiusLimit: 20 });
        expect([c.lowerRadiusLimit, c.upperRadiusLimit]).toEqual([2, 20]);
        setCameraLimits(c, { lowerRadiusLimit: undefined });
        expect(c.lowerRadiusLimit).toBeUndefined();
        const s = makeScene();
        const n = s._beforeRender.length;
        setCameraLimits(c, { upperBetaLimit: 1 }, s);
        expect(s._beforeRender.length).toBe(n);
        expect(c.beta).toBe(1);
    });
});

describe("n09 frame clamp", () => {
    it("beta clamp only with rotation offset; radius only with radius offset", () => {
        const c = cam();
        const s = makeScene();
        attachControl(c, asCanvas(makeCanvas()), s);
        c.beta = -1;
        c.radius = -5;
        tick(s);
        expect(c.beta).toBe(-1);
        expect(c.radius).toBe(-5);
        c.inertialAlphaOffset = 0.01;
        tick(s);
        expect(c.beta).toBe(0.01);
        expect(c.radius).toBe(-5);
        c.inertialRadiusOffset = 0.002;
        tick(s);
        expect(c.radius).toBe(0.01);
        c.beta = 4;
        tick(s); // alpha offset still nonzero? decay
    });
});

describe("n10 wheel", () => {
    it("formula", () => {
        const c = cam();
        const s = makeScene();
        const cv = makeCanvas();
        attachControl(c, asCanvas(cv), s);
        fire(cv, "wheel", { deltaY: 100 });
        expect(c.inertialRadiusOffset).toBeCloseTo((-100 * 10) / 3000, 10);
        const off = c.inertialRadiusOffset;
        tick(s);
        expect(c.radius).toBeCloseTo(10 - off, 10);
        c.radius = 20;
        c.inertialRadiusOffset = 0;
        fire(cv, "wheel", { deltaY: 100 });
        expect(c.inertialRadiusOffset).toBeCloseTo((-100 * 20) / 3000, 10);
    });
});

describe("n12 rotate drag", () => {
    it("formula", () => {
        const c = cam();
        const s = makeScene();
        const cv = makeCanvas();
        attachControl(c, asCanvas(cv), s);
        fire(cv, "pointerdown", pointer());
        fire(cv, "pointermove", pointer({ clientX: 20, clientY: 10 }));
        expect(c.inertialAlphaOffset).toBeCloseTo(-0.02, 12);
        expect(c.inertialBetaOffset).toBeCloseTo(-0.01, 12);
        tick(s);
        expect(c.alpha).toBeCloseTo(0.98, 12);
        expect(c.beta).toBeCloseTo(0.99, 12);
    });
});

describe("n11 pan drag", () => {
    it("formula and direction", () => {
        const c = createArcRotateCamera(0.3, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        const s = makeScene();
        const cv = makeCanvas();
        attachControl(c, asCanvas(cv), s);
        fire(cv, "pointerdown", pointer({ button: 2, buttons: 2 }));
        fire(cv, "pointermove", pointer({ button: 2, clientX: 10, clientY: 5 }));
        expect(c.inertialPanningX).toBeCloseTo(-0.2, 12);
        expect(c.inertialPanningY).toBeCloseTo(0.1, 12);
        // camera right/up from world matrix
        const w = Array.from(c.worldMatrix);
        const right = [w[0]!, w[1]!, w[2]!];
        const up = [w[4]!, w[5]!, w[6]!];
        tick(s);
        const k = 10 / 1000;
        const exp = [0, 1, 2].map((i) => -0.2 * k * right[i]! + 0.1 * k * up[i]!);
        expect(c.target.x).toBeCloseTo(exp[0]!, 9);
        expect(c.target.y).toBeCloseTo(exp[1]!, 9);
        expect(c.target.z).toBeCloseTo(exp[2]!, 9);
    });
    it("tilted camera", () => {
        const c = createArcRotateCamera(0.3, 0.6, 10, { x: 0, y: 0, z: 0 });
        const s = makeScene();
        attachControl(c, asCanvas(makeCanvas()), s);
        const w = Array.from(c.worldMatrix);
        c.inertialPanningX = 1;
        c.inertialPanningY = 2;
        tick(s);
        const k = 10 / 1000;
        for (let i = 0; i < 3; i++) {
            expect([c.target.x, c.target.y, c.target.z][i]).toBeCloseTo(k * (1 * w[i]! + 2 * w[4 + i]!), 9);
        }
    });
});

describe("n13 decay per frame", () => {
    it("per frame independent of dt; eps", () => {
        const c = cam();
        const s = makeScene();
        attachControl(c, asCanvas(makeCanvas()), s);
        c.inertialAlphaOffset = 0.1;
        tick(s, 1, 1000);
        expect(c.inertialAlphaOffset).toBeCloseTo(0.09, 12);
        c.inertialAlphaOffset = 0.0011;
        tick(s, 1, 16);
        expect(c.inertialAlphaOffset).toBe(0);
        c.panningInertia = 0.5;
        c.inertialPanningX = 0.1;
        tick(s);
        expect(c.inertialPanningX).toBeCloseTo(0.05, 12);
        c.inertialPanningX = 0.00019;
        tick(s);
        expect(c.inertialPanningX).toBe(0);
        c.inertialPanningX = 0.00021;
        tick(s);
        expect(c.inertialPanningX).toBeCloseTo(0.000105, 12);
        c.inertialRadiusOffset = 0.0011;
        tick(s);
        expect(c.inertialRadiusOffset).toBe(0);
    });
});

describe("n14 buttons", () => {
    function drag(opts: object | undefined, fields: Record<string, unknown>) {
        const c = cam();
        const cv = makeCanvas();
        attachControl(c, asCanvas(cv), undefined, opts);
        fire(cv, "pointerdown", pointer(fields));
        fire(cv, "pointermove", pointer({ ...fields, clientX: 10, clientY: 10 }));
        return { rot: c.inertialAlphaOffset !== 0, pan: c.inertialPanningX !== 0 };
    }
    it("mapping", () => {
        expect(drag(undefined, { button: 0 })).toEqual({ rot: true, pan: false });
        expect(drag(undefined, { button: 2 })).toEqual({ rot: false, pan: true });
        expect(drag(undefined, { button: 1 })).toEqual({ rot: false, pan: false });
        expect(drag({ pointerMappings: { primaryButton: "pan", secondaryButton: "rotate" } }, { button: 0 })).toEqual({ rot: false, pan: true });
        expect(drag({ pointerMappings: { primaryButton: "pan", secondaryButton: "rotate" } }, { button: 2 })).toEqual({ rot: true, pan: false });
        expect(drag({ pointerMappings: { primaryButton: "pan" } }, { button: 0, pointerType: "touch" })).toEqual({ rot: true, pan: false });
    });
});

describe("n15 pinch", () => {
    it("formula, min, no inertia", () => {
        const c = cam();
        const cv = makeCanvas();
        const s = makeScene();
        attachControl(c, asCanvas(cv), s);
        fire(cv, "touchstart", touches([1, 0, 0], [2, 100, 0]));
        fire(cv, "touchmove", touches([2, 400, 0]));
        expect(c.radius).toBeCloseTo(2.5, 12);
        expect(c.inertialRadiusOffset).toBe(0);
        fire(cv, "touchmove", touches([2, 50, 0]));
        expect(c.radius).toBeCloseTo(20, 12);
        fire(cv, "touchmove", touches([2, 1e7, 0]));
        expect(c.radius).toBe(0.01);
    });
});

describe("n16 disposeScene", () => {
    it("listeners stay after disposeScene; onSceneDispose removes", () => {
        const s = makeScene();
        const cv = makeCanvas();
        attachControl(cam(), asCanvas(cv), s);
        const n = listenerCount(cv);
        expect(n).toBeGreaterThan(0);
        disposeScene(s);
        expect(listenerCount(cv)).toBe(n);
        const s2 = makeScene();
        const cv2 = makeCanvas();
        onSceneDispose(s2, attachControl(cam(), asCanvas(cv2), s2));
        disposeScene(s2);
        expect(listenerCount(cv2)).toBe(0);
    });
});

describe("n18 keys", () => {
    function run(code: string, mods: Record<string, unknown> = {}, frames = 1) {
        enableArcRotateKeyboardControls();
        const c = cam();
        const cv = makeCanvas();
        const s = makeScene();
        attachControl(c, asCanvas(cv), s, { keyboard: true });
        fire(cv, "keydown", key(code, mods));
        // capture offsets after input before decay: hook in by reading after one tick
        const before = { a: c.alpha, b: c.beta, r: c.radius, t: { ...c.target } };
        tick(s, frames);
        return { c, before };
    }
    it("arrows", () => {
        expect(run("ArrowRight").c.alpha).toBeGreaterThan(1);
        expect(run("ArrowUp").c.beta).toBeLessThan(1);
        const p = run("ArrowRight", { ctrlKey: true }).c;
        expect(p.alpha).toBe(1);
        expect(p.target.x !== 0 || p.target.z !== 0).toBe(true);
        expect(run("ArrowUp", { altKey: true }).c.radius).toBeLessThan(10);
        expect(run("ArrowDown", { altKey: true }).c.radius).toBeGreaterThan(10);
        const both = run("ArrowUp", { altKey: true, ctrlKey: true }).c;
        expect(both.radius).toBe(10);
        expect(both.target.y).not.toBe(0);
        const meta = run("ArrowRight", { metaKey: true }).c;
        expect(meta.alpha).toBe(1);
    });
    it("meta held while another key held stops input", () => {
        enableArcRotateKeyboardControls();
        const c = cam();
        const cv = makeCanvas();
        const s = makeScene();
        attachControl(c, asCanvas(cv), s, { keyboard: true });
        fire(cv, "keydown", key("ArrowRight"));
        fire(cv, "keydown", key("MetaLeft", { metaKey: true }));
        c.alpha = 1;
        c.inertialAlphaOffset = 0;
        tick(s);
        expect(c.alpha).toBe(1);
    });
    it("held keys add every frame", () => {
        enableArcRotateKeyboardControls();
        const c = cam();
        const cv = makeCanvas();
        const s = makeScene();
        c.inertia = 0;
        attachControl(c, asCanvas(cv), s, { keyboard: true });
        fire(cv, "keydown", key("ArrowRight"));
        tick(s, 3);
        expect(c.alpha).toBeCloseTo(1 + 3 / 100, 10);
    });
});

describe("n19 key rates", () => {
    it("divisors default and not camera fields; canvas only", () => {
        enableArcRotateKeyboardControls();
        const c = cam();
        c.angularSensibility = 1;
        c.panningSensibility = 1;
        c.inertia = 0;
        c.panningInertia = 0;
        const cv = makeCanvas();
        const s = makeScene();
        attachControl(c, asCanvas(cv), s, { keyboard: true });
        fire(cv, "keydown", key("ArrowRight"));
        tick(s);
        expect(c.alpha).toBeCloseTo(1.01, 12);
        fire(cv, "keyup", key("ArrowRight"));
        fire(cv, "keydown", key("ArrowUp", { altKey: true }));
        tick(s);
        expect(c.radius).toBeCloseTo(10 - 1 / 25, 12);
        fire(cv, "keyup", key("ArrowUp", { altKey: true }));
        fire(cv, "keydown", key("ArrowUp", { ctrlKey: true }));
        const before = Math.hypot(c.target.x, c.target.y, c.target.z);
        tick(s);
        const moved = Math.hypot(c.target.x, c.target.y, c.target.z) - before;
        expect(moved).toBeCloseTo((1 / 50) * (c.radius / 1000), 10);
        expect(cv.listeners.has("keydown")).toBe(true);
        expect((globalThis as { window?: unknown }).window).toBeUndefined();
    });
});

describe("n20 interpolate rejects", () => {
    it("direct write rejects", async () => {
        const c = cam();
        const s = makeScene();
        const st = track(interpolateArcRotateCamera(c, s, { alpha: 2 }));
        tick(s);
        c.radius = 11;
        tick(s);
        await flush();
        expect(st.state).toBe("rejected");
    });
    it("attachControl inertia rejects", async () => {
        const c = cam();
        const s = makeScene();
        const cv = makeCanvas();
        attachControl(c, asCanvas(cv), s);
        const st = track(interpolateArcRotateCamera(c, s, { alpha: 2 }));
        tick(s);
        fire(cv, "wheel", { deltaY: 100 });
        tick(s, 2);
        await flush();
        expect(st.state).toBe("rejected");
    });
    it("target write rejects; newer interpolation rejects older", async () => {
        const c = cam();
        const s = makeScene();
        const st = track(interpolateArcRotateCamera(c, s, { alpha: 2 }));
        tick(s);
        c.target.y = 1;
        tick(s);
        await flush();
        expect(st.state).toBe("rejected");
        const c2 = cam();
        const s2 = makeScene();
        const a = track(interpolateArcRotateCamera(c2, s2, { alpha: 2 }));
        tick(s2);
        const b = track(interpolateArcRotateCamera(c2, s2, { alpha: 0 }));
        tick(s2, 2);
        await flush();
        expect(a.state).toBe("rejected");
        expect(b.state).toBe("pending");
    });
    it("first frame zeroes offsets", () => {
        const c = cam();
        const s = makeScene();
        c.inertialAlphaOffset = 1;
        c.inertialBetaOffset = 1;
        c.inertialRadiusOffset = 1;
        c.inertialPanningX = 1;
        c.inertialPanningY = 1;
        void interpolateArcRotateCamera(c, s, { alpha: 2 }).catch(() => {});
        tick(s);
        expect([c.inertialAlphaOffset, c.inertialBetaOffset, c.inertialRadiusOffset, c.inertialPanningX, c.inertialPanningY]).toEqual([0, 0, 0, 0, 0]);
    });
});

describe("n21 interpolationFactor", () => {
    it("half-life", () => {
        const c = cam();
        const s = makeScene();
        void interpolateArcRotateCamera(c, s, { radius: 20 }, undefined, { interpolationFactor: 0.5 });
        tick(s, 1, 500);
        expect(c.radius).toBeCloseTo(15, 10);
        const c2 = cam();
        const s2 = makeScene();
        void interpolateArcRotateCamera(c2, s2, { radius: 20 });
        tick(s2, 1, 100);
        expect(c2.radius).toBeCloseTo(15, 10);
    });
    it("factor<=0 one frame", async () => {
        const c = cam();
        const s = makeScene();
        const st = track(interpolateArcRotateCamera(c, s, { radius: 20, alpha: 3 }, undefined, { interpolationFactor: -1 }));
        tick(s);
        await flush();
        expect(st.state).toBe("resolved");
        expect(c.radius).toBe(20);
    });
    it("alpha and beta shortest arc", () => {
        const c = createArcRotateCamera(0.1, 0.1, 10, { x: 0, y: 0, z: 0 });
        const s = makeScene();
        void interpolateArcRotateCamera(c, s, { alpha: 2 * Math.PI - 0.1, beta: 2 * Math.PI - 0.1 });
        tick(s);
        expect(c.alpha).toBeLessThan(0.1);
        expect(c.beta).toBeLessThan(0.1);
    });
});

describe("n22 interpolate clamps/termination", () => {
    it("clamps orbit goals to limit fields, target unclamped", async () => {
        const c = cam();
        const s = makeScene();
        setCameraLimits(c, { upperRadiusLimit: 15 });
        const st = track(interpolateArcRotateCamera(c, s, { radius: 100, target: { x: 50, y: 0, z: 0 } }, undefined, { interpolationFactor: 0 }));
        tick(s);
        await flush();
        expect(st.state).toBe("resolved");
        expect(c.radius).toBe(15);
        expect(c.target.x).toBe(50);
    });
    it("resolves only when every channel is within 1e-3 (absolute)", async () => {
        const c = createArcRotateCamera(1, 1, 1000, { x: 0, y: 0, z: 0 });
        const s = makeScene();
        const st = track(interpolateArcRotateCamera(c, s, { radius: 1000.5 }));
        tick(s, 1, 16);
        await flush();
        // after one 16ms frame at factor 0.1 the radius is ~0.45 from goal: far from 1e-3
        expect(st.state).toBe("pending");
    });
});

describe("n57 external drag", () => {
    it("isExternalDragActive aborts and zeroes; pick pending only drops", () => {
        const c = cam();
        const cv = makeCanvas();
        let active = false;
        let pending = false;
        attachControl(c, asCanvas(cv), undefined, { isExternalDragActive: () => active, isExternalPickPending: () => pending });
        fire(cv, "pointerdown", pointer());
        pending = true;
        fire(cv, "pointermove", pointer({ clientX: 10 }));
        expect(c.inertialAlphaOffset).toBe(0);
        pending = false;
        fire(cv, "pointermove", pointer({ clientX: 20 }));
        expect(c.inertialAlphaOffset).toBeCloseTo(-0.01, 12);
        c.inertialRadiusOffset = 0.5;
        c.inertialPanningX = 0.3;
        active = true;
        fire(cv, "pointermove", pointer({ clientX: 30 }));
        expect([c.inertialAlphaOffset, c.inertialBetaOffset, c.inertialPanningX, c.inertialPanningY]).toEqual([0, 0, 0, 0]);
        expect(c.inertialRadiusOffset).toBe(0.5);
        active = false;
        fire(cv, "pointermove", pointer({ clientX: 40 }));
        expect(c.inertialAlphaOffset).toBe(0); // drag ended
    });
});
