// Checks how `await interpolateArcRotateCamera(...)` behaves in the three goHome() situations,
// using the real camera, real attachControl, and a stand-in scene whose _beforeRender we pump by hand.
import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera, interpolateArcRotateCamera } from "@babylonjs/lite";

type Listener = (e: unknown) => void;
function setup() {
    const scene = { _beforeRender: [] as ((d: number) => void)[] } as any;
    const listeners = new Map<string, Listener[]>();
    const canvas = {
        addEventListener: (t: string, h: Listener) => listeners.set(t, [...(listeners.get(t) ?? []), h]),
        removeEventListener: () => {},
        setPointerCapture: () => {},
        releasePointerCapture: () => {},
    } as any;
    const fire = (t: string, e: object) => listeners.get(t)?.forEach((h) => h(e));
    const camera = createArcRotateCamera(1.5, 1, 10, { x: 0, y: 0, z: 0 });
    attachControl(camera, canvas, scene);
    const frame = () => [...scene._beforeRender].forEach((cb) => cb(16));
    return { scene, camera, fire, frame };
}
const outcome = (p: Promise<void>) => p.then(() => "resolves", () => "rejects");

describe("goHome", () => {
    it("(a) camera still coasting from a flick", async () => {
        const { scene, camera, fire, frame } = setup();
        fire("pointerdown", { button: 0, pointerType: "mouse", clientX: 0, clientY: 0, pointerId: 1 });
        fire("pointermove", { clientX: 200, clientY: 50 });
        fire("pointerup", { pointerId: 1 });
        frame(); frame();
        expect(camera.inertialAlphaOffset).not.toBe(0);
        const r = outcome(interpolateArcRotateCamera(camera, scene, { alpha: 0, radius: 4 }));
        for (let i = 0; i < 2000; i++) frame();
        expect(await r).toBe("resolves");
    });

    it("(b) user drags mid-transition", async () => {
        const { scene, camera, fire, frame } = setup();
        const r = outcome(interpolateArcRotateCamera(camera, scene, { alpha: 0, radius: 4 }));
        for (let i = 0; i < 5; i++) frame();
        fire("pointerdown", { button: 0, pointerType: "mouse", clientX: 0, clientY: 0, pointerId: 1 });
        fire("pointermove", { clientX: 30, clientY: 0 });
        for (let i = 0; i < 2000; i++) frame();
        expect(await r).toBe("rejects");
    });

    it("(c) goHome called again half way", async () => {
        const { scene, camera, frame } = setup();
        const first = outcome(interpolateArcRotateCamera(camera, scene, { alpha: 0, radius: 4 }));
        for (let i = 0; i < 5; i++) frame();
        const second = outcome(interpolateArcRotateCamera(camera, scene, { alpha: 0, radius: 4 }));
        for (let i = 0; i < 2000; i++) frame();
        expect(await first).toBe("rejects");
        expect(await second).toBe("resolves");
    });
});
