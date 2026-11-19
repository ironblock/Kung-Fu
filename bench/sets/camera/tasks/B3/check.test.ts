import { describe, expect, it } from "vitest";
import { attachConfigurableFreeControl, createFreeCamera } from "@babylonjs/lite";
import { attachFlyControls } from "../src/fly-controls";
import { asCanvas, fire, key, listenerCount, makeCanvas, makeScene, pointer, tick } from "./helpers";

type P = { x: number; y: number; z: number };

/** A camera with the subject's controls, or, with `library`, with the library's own mouse look and keys. */
function rig(target: P = { x: 0, y: 0, z: 10 }, library = false) {
    const canvas = makeCanvas();
    const scene = makeScene();
    const before = scene._beforeRender.length;
    // Level, at the origin, looking along +Z unless given another target.
    const camera = createFreeCamera({ x: 0, y: 0, z: 0 }, target);
    // The camera's own world-matrix getter, kept before the controls are attached: where the library
    // itself has the camera and where it looks, whatever is put on the camera object afterwards.
    const ownWorld = Object.getOwnPropertyDescriptor(camera, "worldMatrix")!.get!;
    const detach = library
        ? attachConfigurableFreeControl(camera, asCanvas(canvas), scene, { downKeys: ["PageDown"], fastKeys: ["ShiftLeft", "ShiftRight"], fastMultiplier: 3 })
        : attachFlyControls(camera, asCanvas(canvas), scene);
    const world = (): ArrayLike<number> => ownWorld.call(camera) as ArrayLike<number>;
    /** The eye, read as a renderer reads it; it must be where the camera says its position is. */
    const eye = (): P => {
        const w = world();
        const e = { x: w[12]!, y: w[13]!, z: w[14]! };
        // The world matrix may be stored in 32-bit floats.
        expect(e.x).toBeCloseTo(camera.position.x, 4);
        expect(e.y).toBeCloseTo(camera.position.y, 4);
        expect(e.z).toBeCloseTo(camera.position.z, 4);
        return e;
    };
    /** The way the picture looks: the world matrix's forward axis. */
    const forward = (): P => {
        const w = world();
        return { x: w[8]!, y: w[9]!, z: w[10]! };
    };
    const frames = (n: number): void => {
        for (let i = 0; i < n; i++) {
            tick(scene);
            eye();
        }
    };
    return { canvas, scene, camera, detach, before, eye, forward, frames };
}

/** A mouse drag to the right and down, in several moves with a frame after each; then the glide. */
function look(r: ReturnType<typeof rig>): void {
    fire(r.canvas, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
    for (let i = 1; i <= 6; i++) {
        fire(r.canvas, "pointermove", pointer({ clientX: 100 + 60 * i, clientY: 100 + 10 * i }));
        r.frames(1);
    }
    fire(r.canvas, "pointerup", pointer({ clientX: 460, clientY: 160, buttons: 0 }));
    r.frames(60);
}

/** Hold the keys for some frames, let them go, and let the camera glide to a stop. Gives the eye's move. */
function press(r: ReturnType<typeof rig>, codes: string[], frames = 10): P {
    const start = r.eye();
    const shiftKey = codes.some((c) => c.startsWith("Shift"));
    for (const code of codes) {
        fire(r.canvas, "keydown", key(code, { shiftKey }));
    }
    r.frames(frames);
    for (const code of codes) {
        fire(r.canvas, "keyup", key(code));
    }
    r.frames(60);
    const end = r.eye();
    return { x: end.x - start.x, y: end.y - start.y, z: end.z - start.z };
}

/**
 * Fire key downs (a third field true marks an auto-repeat), hold for some frames, let every key go, and let the
 * camera glide to a stop. Gives the eye's move.
 */
function play(r: ReturnType<typeof rig>, downs: [string, boolean?][], frames = 10): P {
    const start = r.eye();
    const shiftKey = downs.some(([c]) => c.startsWith("Shift"));
    for (const [code, repeat] of downs) {
        fire(r.canvas, "keydown", key(code, { shiftKey, repeat: !!repeat }));
    }
    r.frames(frames);
    for (const code of new Set(downs.map(([c]) => c))) {
        fire(r.canvas, "keyup", key(code));
    }
    r.frames(60);
    const end = r.eye();
    return { x: end.x - start.x, y: end.y - start.y, z: end.z - start.z };
}

function hold(r: ReturnType<typeof rig>, codes: string[], frames = 10): void {
    for (const code of codes) {
        fire(r.canvas, "keydown", key(code, { shiftKey: code.startsWith("Shift") }));
    }
    r.frames(frames);
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

    it("turns the view with the mouse as the library's mouse look does, and W then moves along the view", () => {
        const r = rig();
        const lib = rig({ x: 0, y: 0, z: 10 }, true);
        look(r);
        look(lib);
        const f = r.forward();
        const g = lib.forward();
        expect(Math.abs(g.x)).toBeGreaterThan(0.05);
        expect(f.x).toBeCloseTo(g.x, 3);
        expect(f.y).toBeCloseTo(g.y, 3);
        expect(f.z).toBeCloseTo(g.z, 3);

        const d = press(r, ["KeyW"]);
        const len = Math.hypot(d.x, d.y, d.z);
        expect(len).toBeGreaterThan(0);
        expect((d.x * f.x + d.y * f.y + d.z * f.z) / len).toBeGreaterThan(0.999);
        const after = r.forward();
        expect(after.x).toBeCloseTo(f.x, 4);
        expect(after.y).toBeCloseTo(f.y, 4);
        expect(after.z).toBeCloseTo(f.z, 4);
    });

    it("moves a camera that faces +X along +X, three times as far with Shift, at the same height", () => {
        const normal = rig({ x: 10, y: 0, z: 0 });
        const d = press(normal, ["KeyW"]);
        expect(d.x).toBeGreaterThan(0.01);
        expect(d.y).toBeCloseTo(0, 9);
        expect(d.z).toBeCloseTo(0, 4);

        const boosted = rig({ x: 10, y: 0, z: 0 });
        const e = press(boosted, ["ShiftRight", "KeyW"]);
        expect(e.x / d.x).toBeCloseTo(3, 2);
        expect(e.y).toBeCloseTo(0, 9);
        expect(e.z).toBeCloseTo(0, 4);
        const f = boosted.forward();
        expect(f.x).toBeCloseTo(1, 4);
        expect(f.y).toBeCloseTo(0, 4);
    });

    it("moves with every key, and with the Shift keys, as the library's fly controls with that boost do", () => {
        const cases: [string, [string, boolean?][]][] = [
            ["A", [["KeyA"]]],
            ["D", [["KeyD"]]],
            ["S", [["KeyS"]]],
            ["ArrowUp", [["ArrowUp"]]],
            ["ArrowDown", [["ArrowDown"]]],
            ["ArrowLeft", [["ArrowLeft"]]],
            ["ArrowRight", [["ArrowRight"]]],
            ["Shift with D", [["ShiftLeft"], ["KeyD"]]],
            ["both Shifts with W", [["ShiftLeft"], ["ShiftRight"], ["KeyW"]]],
            ["a held Shift's repeats with W", [["ShiftLeft"], ["ShiftLeft", true], ["ShiftLeft", true], ["KeyW"], ["ShiftLeft", true]]],
        ];
        for (const [name, downs] of cases) {
            for (const target of [{ x: 0, y: 0, z: 10 }, { x: 10, y: 0, z: 0 }]) {
                const lib = play(rig(target, true), downs);
                const got = play(rig(target), downs);
                expect(Math.hypot(lib.x, lib.y, lib.z), name).toBeGreaterThan(0.01);
                expect(got.x, name).toBeCloseTo(lib.x, 4);
                expect(got.y, name).toBeCloseTo(lib.y, 4);
                expect(got.z, name).toBeCloseTo(lib.z, 4);
            }
        }
    });

    it("removes everything it added", () => {
        const r = rig();
        expect(listenerCount(r.canvas)).toBeGreaterThan(0);
        r.detach();
        expect(listenerCount(r.canvas)).toBe(0);
        expect(r.scene._beforeRender.length).toBe(r.before);
    });
});
