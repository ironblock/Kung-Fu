import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera, interpolateArcRotateCamera } from "@babylonjs/lite";

type Handler = (e: any) => void;
function setup() {
    const camera = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const handlers = new Map<string, Handler>();
    const canvas = {
        addEventListener: (ev: string, h: Handler) => handlers.set(ev, h),
        removeEventListener: () => {},
        setPointerCapture: () => {},
        releasePointerCapture: () => {},
    } as unknown as HTMLCanvasElement;
    const scene = { _beforeRender: [] as ((d: number) => void)[], camera: null } as any;
    attachControl(camera, canvas, scene);
    // Live for-of, like scene-core's _update.
    const tick = () => { for (const cb of scene._beforeRender) cb(16); };
    const fire = (ev: string, e: object) => handlers.get(ev)!({ pointerId: 1, button: 0, pointerType: "mouse", ...e });
    return { camera, scene, tick, fire };
}
async function outcome(p: Promise<void>): Promise<string> {
    return p.then(() => "resolves", () => "rejects");
}
const settle = (p: Promise<string>, tick: () => void, n = 2000) => { for (let i = 0; i < n; i++) tick(); return p; };

describe("goHome", () => {
    it("(a) camera coasting from a flick", async () => {
        const { camera, scene, tick, fire } = setup();
        fire("pointerdown", { clientX: 0, clientY: 0 });
        fire("pointermove", { clientX: 200, clientY: 50 });
        fire("pointerup", {});
        tick(); tick();
        expect(camera.inertialAlphaOffset).not.toBe(0);
        const p = outcome(interpolateArcRotateCamera(camera, scene, { alpha: 0, radius: 4 }));
        const r = await settle(p, tick);
        console.log("a", r, camera.alpha, camera.radius);
    });
    it("(b) user drags mid-transition", async () => {
        const { camera, scene, tick, fire } = setup();
        const p = outcome(interpolateArcRotateCamera(camera, scene, { alpha: 0, radius: 4 }));
        tick(); tick(); tick();
        fire("pointerdown", { clientX: 0, clientY: 0 });
        fire("pointermove", { clientX: 30, clientY: 0 });
        console.log("b", await settle(p, tick));
    });
    it("(c) goHome called again mid-transition", async () => {
        const { camera, scene, tick } = setup();
        const p1 = outcome(interpolateArcRotateCamera(camera, scene, { alpha: 0, radius: 4 }));
        tick(); tick(); tick();
        const p2 = outcome(interpolateArcRotateCamera(camera, scene, { alpha: 0, radius: 4 }));
        for (let i = 0; i < 2000; i++) tick();
        console.log("c", await p1, "second:", await p2);
    });
});
