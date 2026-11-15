import { describe, it, expect } from "vitest";
import {
    createArcRotateCamera,
    createFreeCamera,
    createBankedFreeCamera,
    attachFreeControl,
    attachConfigurableFreeControl,
    getViewMatrix,
    getProjectionMatrix,
    getViewProjectionMatrix,
    getCameraPosition,
    getEffectiveAspectRatio,
    resolveCameraViewport,
    projectWorldToScreen,
    projectWorldToScreenToRef,
    projectPointToViewportToRef,
    enableOrthographicCamera,
    disableOrthographicCamera,
} from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, key, makeScene, tick } from "./helpers";

const opts = (w = 800, h = 600) => ({ viewport: { x: 0, y: 0, width: w, height: h }, backingWidth: w, backingHeight: h });
const mulPoint = (m: ArrayLike<number>, p: [number, number, number]) => {
    const [x, y, z] = p;
    const cz = x * m[2]! + y * m[6]! + z * m[10]! + m[14]!;
    const cw = x * m[3]! + y * m[7]! + z * m[11]! + m[15]!;
    return cz / cw;
};

describe("n04 free", () => {
    it("free defaults", () => {
        const f = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        expect([f.nearPlane, f.farPlane, f.fov]).toEqual([1, 10000, 0.8]);
    });
});

describe("n07", () => {
    it("reverse-Z for perspective and ortho", () => {
        const f = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        f.nearPlane = 2;
        f.farPlane = 50;
        const p = getProjectionMatrix(f, 1.3);
        expect(mulPoint(p, [0, 0, 2])).toBeCloseTo(1);
        expect(mulPoint(p, [0, 0, 50])).toBeCloseTo(0);
        enableOrthographicCamera(f);
        const o = getProjectionMatrix(f, 1.3);
        expect(mulPoint(o, [0, 0, 2])).toBeCloseTo(1);
        expect(mulPoint(o, [0, 0, 50])).toBeCloseTo(0);
    });
});

describe("n08", () => {
    it("cache buffers rewritten in place", () => {
        const c = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        const v = getViewMatrix(c);
        const p = getProjectionMatrix(c, 1);
        const vp = getViewProjectionMatrix(c, 1);
        const v0 = v[12];
        const p0 = p[0];
        c.alpha = 2;
        expect(getViewMatrix(c)).toBe(v);
        expect(v[12]).not.toBe(v0);
        expect(getProjectionMatrix(c, 2)).toBe(p);
        expect(p[0]).not.toBe(p0);
        expect(getViewProjectionMatrix(c, 1)).toBe(vp);
    });
});

describe("n09", () => {
    it("aspect per call; effective aspect", () => {
        const c = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        expect(getProjectionMatrix(c, 2)[0]).toBeCloseTo(1 / Math.tan(0.4) / 2);
        expect(getProjectionMatrix(c, 1)[0]).toBeCloseTo(1 / Math.tan(0.4));
        c.viewport = { x: 0, y: 0, width: 0.5, height: 1 };
        expect(getEffectiveAspectRatio(c, 800, 600)).toBeCloseTo((800 / 600) * 0.5);
        expect("aspectRatio" in c).toBe(false);
    });
});

describe("n10", () => {
    it("fov plain field, by value", () => {
        const c = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        const a = getProjectionMatrix(c, 1)[5];
        c.fov = 1.2;
        expect(getProjectionMatrix(c, 1)[5]).toBeCloseTo(1 / Math.tan(0.6));
        expect(a).not.toBeCloseTo(1 / Math.tan(0.6));
        c.nearPlane = 0.5;
        expect(getViewProjectionMatrix(c, 1)[14]).not.toBe(0);
        expect(Object.getOwnPropertyDescriptor(c, "fov")?.writable).toBe(true);
    });
});

describe("n11", () => {
    it("floating origin zero translation; worldOrigin projection", () => {
        const pos = { x: 1000, y: 50, z: -300 };
        const abs = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const fo = createFreeCamera(pos, { x: pos.x, y: pos.y, z: pos.z + 10 });
        fo._useFloatingOrigin = true;
        const v = getViewMatrix(fo);
        expect([v[12], v[13], v[14]].map(Math.abs)).toEqual([0, 0, 0]);
        const a = projectWorldToScreen({ x: 1, y: 2, z: 10 }, getViewMatrix(abs), getViewProjectionMatrix(abs, 4 / 3), opts());
        const b = projectWorldToScreen({ x: pos.x + 1, y: pos.y + 2, z: pos.z + 10 }, v, getViewProjectionMatrix(fo, 4 / 3), { ...opts(), worldOrigin: getCameraPosition(fo) });
        expect(b.x).toBeCloseTo(a.x);
        expect(b.y).toBeCloseTo(a.y);
    });
    it("flag set by hand after a cached getViewMatrix call is not seen", () => {
        const fo = createFreeCamera({ x: 5, y: 0, z: 0 }, { x: 5, y: 0, z: 10 });
        getViewMatrix(fo);
        fo._useFloatingOrigin = true;
        expect(getViewMatrix(fo)[12]).not.toBe(0);
    });
});

describe("n12", () => {
    it("resolveCameraViewport", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        expect(resolveCameraViewport(c, 100, 100)).toEqual({ x: 0, y: 0, width: 100, height: 100 });
        c.viewport = { x: 0.105, y: 0, width: 0.5, height: 0.25 };
        // y from bottom: bottom quarter -> pixel y 75
        expect(resolveCameraViewport(c, 100, 100)).toEqual({ x: 10, y: 75, width: 51, height: 25 });
        c.viewport = { x: -0.5, y: 0.9, width: 1, height: 0.5 };
        expect(resolveCameraViewport(c, 100, 100)).toEqual({ x: 0, y: 0, width: 50, height: 10 });
    });
});

describe("n13", () => {
    it("viewport offset and css", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const vp = { x: 100, y: 50, width: 400, height: 300 };
        const r = projectWorldToScreen({ x: 0, y: 0, z: 10 }, getViewMatrix(c), getViewProjectionMatrix(c, 4 / 3), { viewport: vp, backingWidth: 1600, backingHeight: 1200 });
        expect(r.x).toBeCloseTo(300);
        expect(r.y).toBeCloseTo(200);
        expect([r.cssX, r.cssY]).toEqual([r.x, r.y]);
        const r2 = projectWorldToScreen({ x: 0, y: 0, z: 10 }, getViewMatrix(c), getViewProjectionMatrix(c, 4 / 3), {
            viewport: vp, backingWidth: 1600, backingHeight: 1200, cssWidth: 800, cssHeight: 300,
        });
        expect(r2.cssX).toBeCloseTo(150);
        expect(r2.cssY).toBeCloseTo(50);
    });
});

describe("n14-n15", () => {
    const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const V = getViewMatrix(c);
    const VP = getViewProjectionMatrix(c, 4 / 3);
    it("z at near is 1; flags", () => {
        expect(projectWorldToScreen({ x: 0, y: 0, z: 1 }, V, VP, opts()).z).toBeCloseTo(1);
        const behind = projectWorldToScreen({ x: 0, y: 0, z: -5 }, V, VP, opts());
        expect(behind).toMatchObject({ behindCamera: true, offscreen: true, clipped: true });
        const side = projectWorldToScreen({ x: 100, y: 0, z: 10 }, V, VP, opts());
        expect(side.offscreen).toBe(true);
        expect(side.x).toBeGreaterThan(800); // unclamped
        const near = projectWorldToScreen({ x: 0, y: 0, z: 0.5 }, V, VP, opts());
        expect(near.offscreen).toBe(false);
        expect(near.clipped).toBe(true);
        const far = projectWorldToScreen({ x: 0, y: 0, z: 20000 }, V, VP, opts());
        expect(far).toMatchObject({ offscreen: false, clipped: true });
        const zero = projectWorldToScreen({ x: 0, y: 0, z: 0 }, V, VP, opts());
        expect(Number.isNaN(zero.x) && zero.clipped && zero.offscreen).toBe(true);
        const nan = projectWorldToScreen({ x: NaN, y: 0, z: 10 }, V, VP, opts());
        expect(Number.isNaN(nan.cssY) && nan.clipped && nan.offscreen).toBe(true);
    });
    it("ortho behindCamera via view", () => {
        const o = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        enableOrthographicCamera(o, { halfHeight: 5 });
        const r = projectWorldToScreen({ x: 0, y: 0, z: -3 }, getViewMatrix(o), getViewProjectionMatrix(o, 1), opts());
        expect(r.clipW).toBe(1);
        expect(r.behindCamera).toBe(true);
    });
});

describe("n16", () => {
    it("validation", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const V = getViewMatrix(c);
        const VP = getViewProjectionMatrix(c, 1);
        const res = { x: 0, y: 0, z: 0, cssX: 0, cssY: 0, clipW: 0, behindCamera: false, clipped: false, offscreen: false };
        const run = (o: object) => () => projectWorldToScreenToRef({ x: 0, y: 0, z: 5 }, V, VP, { ...opts(), ...o } as never, res);
        expect(run({ viewport: { x: 0, y: 0, width: 0, height: 10 } })).toThrow(RangeError);
        expect(run({ backingWidth: Infinity })).toThrow(RangeError);
        expect(run({ viewport: { x: NaN, y: 0, width: 10, height: 10 } })).toThrow(RangeError);
        expect(run({ worldOrigin: { x: 0, y: Infinity, z: 0 } })).toThrow(RangeError);
        expect(run({ cssWidth: 10 })).toThrow(RangeError);
        expect(run({ cssWidth: 10, cssHeight: 0 })).toThrow(RangeError);
        expect(run({ cssWidth: 10, cssHeight: 10 })).not.toThrow();
        expect(run({ viewport: { x: -50, y: -20, width: 10, height: 10 } })).not.toThrow();
    });
});

describe("n17", () => {
    it("projectPointToViewportToRef", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const VP = getViewProjectionMatrix(c, 1);
        const ident = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 3, 0, 0, 1]);
        const out = { x: 0, y: 0, z: 0, tag: "keep" } as { x: number; y: number; z: number; tag: string };
        projectPointToViewportToRef({ x: -3, y: 0, z: 10 }, ident as never, VP, { x: 0, y: 0, width: 0, height: 0 }, out);
        expect(out).toEqual({ x: 0, y: 0, z: expect.any(Number), tag: "keep" });
        const out2 = { x: 0, y: 0, z: 0 };
        projectPointToViewportToRef({ x: -3, y: 0, z: 10 }, ident as never, VP, { x: 0, y: 0, width: 100, height: 100 }, out2);
        expect(out2.x).toBeCloseTo(50); // world translation applied
        expect(() => projectPointToViewportToRef({ x: NaN, y: 0, z: 10 }, ident as never, VP, { x: 0, y: 0, width: -5, height: 100 }, out2)).not.toThrow();
    });
});

describe("n19-n22 ortho", () => {
    it("n19 fov ignored, halfHeight, derived planes, number fixes", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        const o = enableOrthographicCamera(c);
        expect(o.halfHeight).toBe(1);
        const m = getProjectionMatrix(c, 2);
        expect(m[0]).toBeCloseTo(2 / 4);
        expect(m[5]).toBeCloseTo(1);
        c.fov = 0.1;
        expect(getProjectionMatrix(c, 2)[5]).toBeCloseTo(1);
        o.halfHeight = 2;
        expect(getProjectionMatrix(c, 3)[0]).toBeCloseTo(2 / 12);
        o.left = 0;
        const m2 = getProjectionMatrix(c, 3);
        expect(m2[0]).toBeCloseTo(2 / 6);
        expect(m2[12]).toBeCloseTo(6 / -6);
    });
    it("n20 ortho = null by hand keeps cache, then stale terms", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        enableOrthographicCamera(c, { left: -1, right: 3 });
        getProjectionMatrix(c, 1);
        c.ortho = null;
        expect(getProjectionMatrix(c, 1)[15]).toBe(1); // still ortho
        c.fov = 0.9;
        const m = getProjectionMatrix(c, 1);
        expect(m[11]).toBe(1);
        expect(m[15]).toBe(1); // stale
        expect(m[12]).not.toBe(0);
        // other trigger: aspect change also rebuilds
        const d = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        enableOrthographicCamera(d);
        getProjectionMatrix(d, 1);
        d.ortho = null;
        expect(getProjectionMatrix(d, 2)[11]).toBe(1); // rebuilt as perspective without move/fov change
        // disable path clean
        const e = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        enableOrthographicCamera(e, { left: -1, right: 3 });
        getProjectionMatrix(e, 1);
        disableOrthographicCamera(e);
        const pe = getProjectionMatrix(e, 1);
        expect([pe[12], pe[13], pe[15], pe[11]]).toEqual([0, 0, 0, 1]);
    });
    it("n21 re-enable replaces object", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        const a = enableOrthographicCamera(c, { halfHeight: 3 });
        const b = enableOrthographicCamera(c, { halfHeight: 5 });
        expect(c.ortho).toBe(b);
        expect(a).not.toBe(b);
        a.halfHeight = 10;
        expect(getProjectionMatrix(c, 1)[5]).toBeCloseTo(1 / 5);
        expect(b.halfHeight).toBe(5);
        expect(b.left).toBe(null);
    });
    it("n22 view-space units around view axis; depth from near/far", () => {
        const c = createFreeCamera({ x: 10, y: 0, z: 0 }, { x: 10, y: 0, z: 5 });
        c.nearPlane = 1;
        c.farPlane = 21;
        enableOrthographicCamera(c, { halfHeight: 2 });
        const r = projectWorldToScreen({ x: 12, y: 2, z: 11 }, getViewMatrix(c), getViewProjectionMatrix(c, 1), opts(100, 100));
        expect(r.x).toBeCloseTo(100);
        expect(r.y).toBeCloseTo(0);
        expect(r.z).toBeCloseTo(0.5);
    });
});

describe("free camera", () => {
    it("n37 yaw/pitch from creation; target write overwritten by next input", () => {
        const f = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 3 });
        expect(f._yaw).toBeCloseTo(Math.atan2(3, 3));
        expect(f._pitch).toBeCloseTo(Math.atan2(4, Math.hypot(3, 3)));
        const s = makeScene();
        const canvas = makeCanvas();
        attachFreeControl(f, asCanvas(canvas), s);
        f.target.set(-10, 0, 0);
        expect(f._yaw).toBeCloseTo(Math.PI / 4);
        fire(canvas, "keydown", key("KeyD"));
        tick(s, 1);
        fire(canvas, "keyup", key("KeyD"));
        const d = { x: f.target.x - f.position.x, y: f.target.y - f.position.y, z: f.target.z - f.position.z };
        expect(Math.atan2(d.x, d.z)).toBeCloseTo(Math.PI / 4);
    });
    it("n38 bindings; mouse buttons", () => {
        const f = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 1 });
        const s = makeScene();
        const canvas = makeCanvas();
        attachFreeControl(f, asCanvas(canvas), s);
        fire(canvas, "keydown", key("ArrowUp"));
        tick(s, 1);
        fire(canvas, "keyup", key("ArrowUp"));
        expect(f.position.y).toBeGreaterThan(0);
        expect(f.position.y).toBeCloseTo(f.position.z);
        const y0 = f.position.y;
        const x0 = f.position.x;
        fire(canvas, "keydown", key("Space"));
        tick(s, 1);
        fire(canvas, "keyup", key("Space"));
        expect(f.position.y).toBeGreaterThan(y0);
        fire(canvas, "keydown", key("ArrowLeft"));
        tick(s, 1);
        fire(canvas, "keyup", key("ArrowLeft"));
        expect(f.position.x).toBeLessThan(x0);
        for (const button of [0, 1, 2, 3]) {
            const g = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
            const s2 = makeScene();
            const cv = makeCanvas();
            attachFreeControl(g, asCanvas(cv), s2);
            fire(cv, "pointerdown", pointer({ button, clientX: 0 }));
            fire(cv, "pointermove", pointer({ button, clientX: 100 }));
            tick(s2, 1);
            if (button < 3) {
                expect(g._yaw).not.toBe(0);
            } else {
                expect(g._yaw).toBe(0); // button 3 does not turn
            }
        }
        expect(canvas.listeners.has("pointerlockchange")).toBe(false);
    });
    it("n39 speed formula, decay, snap, pitch clamp", () => {
        const f = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        f.inertia = 0.5;
        const s = makeScene();
        const canvas = makeCanvas();
        attachFreeControl(f, asCanvas(canvas), s);
        fire(canvas, "keydown", key("KeyW"));
        tick(s, 1, 40);
        expect(f.position.z).toBeCloseTo((2 * 40) / Math.sqrt(100000));
        fire(canvas, "keyup", key("KeyW"));
        const z1 = f.position.z;
        tick(s, 1, 40);
        expect(f.position.z - z1).toBeCloseTo(0.5 * (2 * 40) / Math.sqrt(100000));
        tick(s, 30, 40);
        const z2 = f.position.z;
        tick(s, 1, 40);
        expect(f.position.z).toBe(z2);
        fire(canvas, "pointerdown", pointer({ clientY: 0 }));
        fire(canvas, "pointermove", pointer({ clientY: -100000 }));
        tick(s, 1);
        expect(f._pitch).toBeCloseTo(Math.PI / 2 - 0.01);
    });
    it("n24 no scene no move", () => {
        for (const attach of [attachFreeControl, attachConfigurableFreeControl]) {
            const f = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
            const cv = makeCanvas();
            attach(f, asCanvas(cv));
            fire(cv, "keydown", key("KeyW"));
            fire(cv, "pointerdown", pointer());
            fire(cv, "pointermove", pointer({ clientX: 50 }));
            expect([f.position.z, f._yaw]).toEqual([0, 0]);
        }
    });
    it("n40 configurable", () => {
        const mk = (o: object) => {
            const f = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
            const s = makeScene();
            const cv = makeCanvas();
            attachConfigurableFreeControl(f, asCanvas(cv), s, o);
            return { f, s, cv };
        };
        let { f, s, cv } = mk({ upKeys: ["KeyE"] });
        fire(cv, "keydown", key("Space"));
        tick(s, 1);
        expect(f.position.y).toBe(0);
        fire(cv, "keydown", key("KeyE"));
        tick(s, 1);
        expect(f.position.y).toBeGreaterThan(0);
        ({ f, s, cv } = mk({ fastKeys: ["ShiftLeft"], upKeys: [], downKeys: [] }));
        fire(cv, "keydown", key("KeyW"));
        fire(cv, "keydown", key("ShiftLeft"));
        tick(s, 1, 40);
        expect(f.position.z).toBeCloseTo(80 / Math.sqrt(100000));
        ({ f, s, cv } = mk({ fastKeys: ["ShiftLeft"], fastMultiplier: 3, upKeys: [], downKeys: [] }));
        fire(cv, "keydown", key("KeyW"));
        fire(cv, "keydown", key("ShiftLeft"));
        tick(s, 1, 40);
        expect(f.position.z).toBeCloseTo(240 / Math.sqrt(100000));
    });
    it("n41 banked roll; controls ignore up; degenerate identity", () => {
        const b = createBankedFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const v0 = b.worldMatrixVersion;
        b.upVector.x = 1;
        b.upVector.y = 0;
        expect(b.worldMatrixVersion).not.toBe(v0);
        const w = b.worldMatrix;
        expect(Math.abs(w[4]!)).toBeCloseTo(1); // local up now world x
        const s = makeScene();
        const cv = makeCanvas();
        attachFreeControl(b, asCanvas(cv), s);
        fire(cv, "keydown", key("Space"));
        tick(s, 1);
        expect(b.position.y).toBeGreaterThan(0);
        expect(b.position.x).toBe(0);
        const d = createBankedFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 5, z: 0 });
        const m = d.worldMatrix;
        expect([m[0], m[5], m[10], m[1], m[2]]).toEqual([1, 1, 1, 0, 0]);
    });
});
