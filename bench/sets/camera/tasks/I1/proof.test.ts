// Shows on the library itself that the expected answer of I1 is so. Not a check of a subject's answer.
import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera, interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { asCanvas, fire, makeCanvas, makeScene, pointer, tick } from "./helpers";
import type { FakeCanvas } from "./helpers";

function start(): { camera: ArcRotateCamera; canvas: FakeCanvas; scene: SceneContext; hooks: number } {
    const scene = makeScene();
    const camera = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const canvas = makeCanvas();
    attachControl(camera, asCanvas(canvas), scene);
    return { camera, canvas, scene, hooks: scene._beforeRender.length };
}

function drag(canvas: FakeCanvas, fromX: number, toX: number): void {
    fire(canvas, "pointerdown", pointer({ clientX: fromX, clientY: 100 }));
    fire(canvas, "pointermove", pointer({ clientX: toX, clientY: 100 }));
    fire(canvas, "pointerup", pointer({ clientX: toX, clientY: 100 }));
}

function watch(promise: Promise<void>): { outcome: string } {
    const seen = { outcome: "pending" };
    promise.then(
        () => (seen.outcome = "resolves"),
        () => (seen.outcome = "rejects")
    );
    return seen;
}

/** Run frames until only the controls' own hook is left, or 3,000 frames have gone by. */
async function settle(scene: SceneContext, hooks: number): Promise<void> {
    for (let i = 0; i < 3000 && scene._beforeRender.length > hooks; i++) {
        tick(scene);
    }
    await new Promise((done) => setTimeout(done, 0));
}

describe("I1: what the await of a transition does", () => {
    it("(a) resolves when the camera was still coasting from a flick at the call", async () => {
        const { camera, canvas, scene, hooks } = start();
        drag(canvas, 100, 400);
        tick(scene, 2);
        expect(camera.inertialAlphaOffset).not.toBe(0);
        const seen = watch(interpolateArcRotateCamera(camera, scene, { alpha: 0, radius: 4 }));
        await settle(scene, hooks);
        expect(seen.outcome).toBe("resolves");
        expect(camera.alpha).toBe(0);
        expect(camera.radius).toBe(4);
    });

    it("(b) rejects when the user starts to drag during the transition", async () => {
        const { camera, canvas, scene, hooks } = start();
        const seen = watch(interpolateArcRotateCamera(camera, scene, { alpha: 0, radius: 4 }));
        tick(scene, 3);
        expect(seen.outcome).toBe("pending");
        drag(canvas, 100, 400);
        await settle(scene, hooks);
        expect(seen.outcome).toBe("rejects");
    });

    it("(c) rejects the first call when a second call is made during the transition", async () => {
        const { camera, scene, hooks } = start();
        const first = watch(interpolateArcRotateCamera(camera, scene, { alpha: 0, radius: 4 }));
        tick(scene, 3);
        const second = watch(interpolateArcRotateCamera(camera, scene, { alpha: 0, radius: 4 }));
        await settle(scene, hooks);
        expect(first.outcome).toBe("rejects");
        expect(second.outcome).toBe("resolves");
    });
});
