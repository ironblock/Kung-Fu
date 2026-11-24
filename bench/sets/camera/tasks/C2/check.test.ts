import { describe, it, expect } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { asCanvas, fire, listenerCount, makeCanvas, makeScene, pointer, tick } from "./helpers";
import type { FakeCanvas } from "./helpers";
import { attachOrbitWithCtrlPan } from "../src/mac-pan";

function camera(): ArcRotateCamera {
    return createArcRotateCamera(0.6, 1.0, 10, { x: 0, y: 0, z: 0 });
}

function drag(canvas: FakeCanvas, scene: SceneContext, button: number, ctrlKey: boolean): void {
    const buttons = button === 2 ? 2 : 1;
    fire(canvas, "pointerdown", pointer({ button, buttons, ctrlKey, clientX: 100, clientY: 100 }));
    fire(canvas, "pointermove", pointer({ button: -1, buttons, ctrlKey, clientX: 130, clientY: 110 }));
    fire(canvas, "pointermove", pointer({ button: -1, buttons, ctrlKey, clientX: 170, clientY: 125 }));
    fire(canvas, "pointerup", pointer({ button, buttons: 0, ctrlKey, clientX: 170, clientY: 125 }));
    tick(scene, 200);
}

function pose(cam: ArcRotateCamera) {
    return { alpha: cam.alpha, beta: cam.beta, radius: cam.radius, x: cam.target.x, y: cam.target.y, z: cam.target.z };
}

/** The pose a right-button drag gives with the library's default controls. */
function defaultRightDrag() {
    const cam = camera();
    const canvas = makeCanvas();
    const scene = makeScene();
    attachControl(cam, asCanvas(canvas), scene);
    drag(canvas, scene, 2, false);
    return pose(cam);
}

function subject() {
    const cam = camera();
    const canvas = makeCanvas();
    const scene = makeScene();
    const detach = attachOrbitWithCtrlPan(cam, asCanvas(canvas), scene);
    return { cam, canvas, scene, detach };
}

function expectSamePose(a: ReturnType<typeof pose>, b: ReturnType<typeof pose>): void {
    for (const k of Object.keys(a) as (keyof typeof a)[]) {
        expect(a[k]).toBeCloseTo(b[k], 9);
    }
}

describe("attachOrbitWithCtrlPan", () => {
    it("pans on Ctrl + primary drag, as far as a right drag, without orbiting", () => {
        const expected = defaultRightDrag();
        expect(Math.hypot(expected.x, expected.y, expected.z)).toBeGreaterThan(0.01);

        const { cam, canvas, scene } = subject();
        drag(canvas, scene, 0, true);
        expectSamePose(pose(cam), expected);
    });

    it("still pans on a right drag", () => {
        const expected = defaultRightDrag();
        const { cam, canvas, scene } = subject();
        drag(canvas, scene, 2, false);
        expectSamePose(pose(cam), expected);
    });

    it("still orbits on a primary drag without Ctrl", () => {
        const ref = camera();
        const refCanvas = makeCanvas();
        const refScene = makeScene();
        attachControl(ref, asCanvas(refCanvas), refScene);
        drag(refCanvas, refScene, 0, false);

        const { cam, canvas, scene } = subject();
        drag(canvas, scene, 0, false);
        expect(cam.alpha).not.toBeCloseTo(0.6, 3);
        expectSamePose(pose(cam), pose(ref));
    });

    it("zooms with the wheel as the library's defaults do", () => {
        const ref = camera();
        const refCanvas = makeCanvas();
        const refScene = makeScene();
        attachControl(ref, asCanvas(refCanvas), refScene);
        fire(refCanvas, "wheel", { deltaY: -100, deltaMode: 0 });
        tick(refScene, 200);

        const { cam, canvas, scene } = subject();
        fire(canvas, "wheel", { deltaY: -100, deltaMode: 0 });
        tick(scene, 200);
        expect(cam.radius).toBeCloseTo(ref.radius, 9);
    });

    it("removes everything it added", () => {
        const cam = camera();
        const canvas = makeCanvas();
        const scene = makeScene();
        const before = scene._beforeRender.length;
        const detach = attachOrbitWithCtrlPan(cam, asCanvas(canvas), scene);
        detach();
        expect(listenerCount(canvas)).toBe(0);
        expect(scene._beforeRender.length).toBe(before);
    });
});
