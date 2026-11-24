import { describe, expect, it } from "vitest";
import { createFreeCamera, createBankedFreeCamera, attachFreeControl, attachConfigurableFreeControl, getViewMatrix } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, key, makeScene, tick } from "./helpers";

const fc = () => createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
const arr = (m: ArrayLike<number>) => Array.from(m);

describe("n02 defaults", () => {
    it("", () => {
        const c = fc();
        expect([c.fov, c.nearPlane, c.farPlane, c.speed, c.angularSensitivity, c.inertia]).toEqual([0.8, 1, 10000, 2, 2000, 0.9]);
    });
});

describe("n04 no scene", () => {
    for (const attach of [attachFreeControl, attachConfigurableFreeControl]) {
        it(attach.name, () => {
            const c = fc();
            const cv = makeCanvas();
            attach(c, asCanvas(cv));
            fire(cv, "keydown", key("KeyW"));
            fire(cv, "pointerdown", pointer());
            fire(cv, "pointermove", pointer({ clientX: 100, clientY: 50 }));
            expect([c.position.x, c.position.y, c.position.z, c.target.x, c.target.y, c.target.z, c._yaw, c._pitch]).toEqual([0, 0, -10, 0, 0, 0, 0, 0]);
            const s = makeScene();
            const c2 = fc();
            const cv2 = makeCanvas();
            attach(c2, asCanvas(cv2), s);
            fire(cv2, "keydown", key("KeyW"));
            tick(s);
            expect(c2.position.z).toBeGreaterThan(-10);
        });
    }
});

describe("n38 view from position and target", () => {
    it("moving position turns; moving both translates", () => {
        const c = fc();
        const r0 = arr(c.worldMatrix).slice(0, 11);
        c.position.x = 5;
        const r1 = arr(c.worldMatrix).slice(0, 11);
        expect(r1).not.toEqual(r0);
        const c2 = fc();
        c2.position.x += 5;
        c2.target.x += 5;
        const r2 = arr(c2.worldMatrix).slice(0, 11);
        r0.forEach((v, i) => expect(r2[i]).toBeCloseTo(v, 12));
        // _yaw/_pitch do not feed the view
        const c3 = fc();
        const v0 = arr(getViewMatrix(c3));
        c3._yaw = 1;
        expect(arr(getViewMatrix(c3))).toEqual(v0);
    });
});

describe("n39 controls rewrite target from yaw/pitch", () => {
    it("", () => {
        const c = fc();
        const s = makeScene();
        const cv = makeCanvas();
        attachFreeControl(c, asCanvas(cv), s);
        c.target.set(10, 0, -10); // look along +X: yaw would be PI/2
        expect(c._yaw).toBe(0);
        fire(cv, "keydown", key("KeyW"));
        tick(s);
        const d = { x: c.target.x - c.position.x, y: c.target.y - c.position.y, z: c.target.z - c.position.z };
        expect(Math.hypot(d.x, d.y, d.z)).toBeCloseTo(1, 12);
        expect(d.z).toBeCloseTo(1, 12);
        expect(d.x).toBeCloseTo(0, 12);
    });
    it("no rewrite on frames without input", () => {
        const c = fc();
        const s = makeScene();
        attachFreeControl(c, asCanvas(makeCanvas()), s);
        c.target.set(10, 0, -10);
        tick(s, 3);
        expect(c.target.x).toBe(10);
    });
});

describe("n40 initial yaw/pitch and clamp", () => {
    it("", () => {
        const c = createFreeCamera({ x: 1, y: 2, z: 3 }, { x: 4, y: 6, z: 7 });
        expect(c._yaw).toBeCloseTo(Math.atan2(3, 4), 12);
        expect(c._pitch).toBeCloseTo(Math.atan2(4, 5), 12);
        const s = makeScene();
        const cv = makeCanvas();
        attachFreeControl(c, asCanvas(cv), s);
        fire(cv, "pointerdown", pointer());
        fire(cv, "pointermove", pointer({ clientY: -100000 }));
        tick(s);
        expect(c._pitch).toBeCloseTo(Math.PI / 2 - 0.01, 12);
        fire(cv, "pointermove", pointer({ clientY: 200000 }));
        tick(s);
        expect(c._pitch).toBeCloseTo(-(Math.PI / 2 - 0.01), 12);
    });
});

describe("n41 keys and buttons", () => {
    function moved(code: string) {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 1 }); // pitched 45deg up, yaw 0
        const s = makeScene();
        const cv = makeCanvas();
        attachFreeControl(c, asCanvas(cv), s);
        fire(cv, "keydown", key(code));
        tick(s);
        return [c.position.x, c.position.y, c.position.z];
    }
    it("keys", () => {
        for (const k of ["KeyW", "ArrowUp"]) {
            const p = moved(k);
            expect(p[1]).toBeGreaterThan(0);
            expect(p[1]).toBeCloseTo(p[2]!, 12);
        }
        for (const k of ["KeyS", "ArrowDown"]) expect(moved(k)[2]).toBeLessThan(0);
        for (const k of ["KeyA", "ArrowLeft"]) expect(moved(k)[0]).toBeLessThan(0);
        for (const k of ["KeyD", "ArrowRight"]) expect(moved(k)[0]).toBeGreaterThan(0);
        for (const k of ["Space", "PageUp"]) expect(moved(k)).toEqual([0, expect.any(Number), 0]);
        for (const k of ["Space", "PageUp"]) expect(moved(k)[1]).toBeGreaterThan(0);
        for (const k of ["ShiftLeft", "ShiftRight", "PageDown"]) expect(moved(k)[1]).toBeLessThan(0);
    });
    it("any button turns", () => {
        for (const button of [0, 1, 2, 3, 4]) {
            const c = fc();
            const s = makeScene();
            const cv = makeCanvas();
            attachFreeControl(c, asCanvas(cv), s);
            fire(cv, "pointerdown", pointer({ button }));
            fire(cv, "pointermove", pointer({ button, clientX: 100 }));
            tick(s);
            expect(c._yaw, `button ${button}`).not.toBe(0);
        }
    });
});

describe("n42 accumulators", () => {
    it("step speed*dt/316.2 then decay; zeroed below speed*0.001", () => {
        const c = fc();
        c.inertia = 0.5;
        const s = makeScene();
        const cv = makeCanvas();
        attachFreeControl(c, asCanvas(cv), s);
        fire(cv, "keydown", key("KeyW"));
        tick(s, 1, 50);
        const step = (2 * 50) / Math.sqrt(100000);
        expect(c.position.z + 10).toBeCloseTo(step, 10);
        fire(cv, "keyup", key("KeyW"));
        tick(s, 1, 50);
        expect(c.position.z + 10).toBeCloseTo(step * 1.5, 10);
        let z = c.position.z;
        let last = 0;
        for (let i = 0; i < 100; i++) {
            tick(s, 1, 50);
            const d = c.position.z - z;
            z = c.position.z;
            if (d === 0) break;
            last = d;
        }
        expect(last).toBeGreaterThanOrEqual(0.002);
        expect(last * 0.5).toBeLessThan(0.002);
    });
});

describe("n43 canvas keys and tabIndex", () => {
    for (const attach of [attachFreeControl, attachConfigurableFreeControl]) {
        it(attach.name, () => {
            const cv = makeCanvas();
            attach(fc(), asCanvas(cv));
            expect(cv.listeners.get("keydown")?.length).toBe(1);
            expect(cv.tabIndex).toBe(0);
            const cv2 = makeCanvas();
            cv2.setAttribute("tabindex", "5");
            cv2.tabIndex = 5;
            attach(fc(), asCanvas(cv2));
            expect(cv2.tabIndex).toBe(5);
        });
    }
});

describe("n44 configurable", () => {
    function run(opts: object, codes: string[]) {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        const s = makeScene();
        const cv = makeCanvas();
        attachConfigurableFreeControl(c, asCanvas(cv), s, opts);
        for (const k of codes) fire(cv, "keydown", key(k));
        tick(s);
        return [c.position.x, c.position.y, c.position.z];
    }
    it("", () => {
        expect(run({ fastKeys: ["KeyF"] }, ["KeyW", "KeyF"])).toEqual(run({}, ["KeyW"]));
        expect(run({ fastKeys: ["KeyF"], fastMultiplier: 3 }, ["KeyW", "KeyF"])[2]).toBeCloseTo(3 * run({}, ["KeyW"])[2]!, 12);
        expect(run({ upKeys: ["KeyE"] }, ["Space"])[1]).toBe(0);
        expect(run({ upKeys: ["KeyE"] }, ["KeyE"])[1]).toBeGreaterThan(0);
        expect(run({ downKeys: ["KeyQ"] }, ["ShiftLeft"])[1]).toBe(0);
        expect(run({ upKeys: ["KeyW"] }, ["KeyW"])[2]).toBeGreaterThan(0); // WASD still moves
    });
});

describe("n45 banked", () => {
    it("rolls on upVector write; default equals free camera", () => {
        const b = createBankedFreeCamera({ x: 1, y: 2, z: -10 }, { x: 0, y: 0, z: 0 });
        const f = createFreeCamera({ x: 1, y: 2, z: -10 }, { x: 0, y: 0, z: 0 });
        expect(arr(b.worldMatrix)).toEqual(arr(f.worldMatrix));
        expect(arr(getViewMatrix(b))).toEqual(arr(getViewMatrix(f)));
        const v0 = arr(getViewMatrix(b));
        b.upVector.x = 1;
        expect(arr(getViewMatrix(b))).not.toEqual(v0);
    });
});

describe("n46 degenerate", () => {
    it("target==position or along up", () => {
        for (const t of [{ x: 1, y: 2, z: 3 }, { x: 1, y: 10, z: 3 }, { x: 1, y: -10, z: 3 }]) {
            const c = createFreeCamera({ x: 1, y: 2, z: 3 }, t);
            expect(arr(c.worldMatrix)).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1]);
        }
    });
});
