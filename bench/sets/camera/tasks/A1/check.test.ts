import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera, getCameraPosition, getViewMatrix } from "@babylonjs/lite";
import type { ArcRotateCamera } from "@babylonjs/lite";
import { focusOn } from "../src/focus";
import { asCanvas, fire, makeCanvas, makeScene, pointer, tick } from "./helpers";

type V = { x: number; y: number; z: number };

function expectNear(a: V, b: V): void {
    expect(a.x).toBeCloseTo(b.x, 4);
    expect(a.y).toBeCloseTo(b.y, 4);
    expect(a.z).toBeCloseTo(b.z, 4);
}

/** Where the point lands in the camera's view space. */
function inView(camera: ArcRotateCamera, p: V): V {
    const v = getViewMatrix(camera);
    return {
        x: p.x * v[0]! + p.y * v[4]! + p.z * v[8]! + v[12]!,
        y: p.x * v[1]! + p.y * v[5]! + p.z * v[9]! + v[13]!,
        z: p.x * v[2]! + p.y * v[6]! + p.z * v[10]! + v[14]!,
    };
}

/**
 * The camera's own world-matrix getter, kept before the answer runs. What it gives is where the library
 * itself has the camera, whatever the answer puts on the camera object afterwards.
 */
function keepWorld(camera: ArcRotateCamera): () => ArrayLike<number> {
    const get = Object.getOwnPropertyDescriptor(camera, "worldMatrix")!.get!;
    return () => get.call(camera) as ArrayLike<number>;
}

/** The eye, and where the point lands in view space, both read from the kept world matrix. */
function expectReal(world: () => ArrayLike<number>, eye: V, p: V, distance: number): void {
    const w = world();
    expectNear({ x: w[12]!, y: w[13]!, z: w[14]! }, eye);
    const d = { x: p.x - w[12]!, y: p.y - w[13]!, z: p.z - w[14]! };
    // The world matrix's rows 0, 1 and 2 are the camera's right, up and forward axes.
    expectNear({
        x: d.x * w[0]! + d.y * w[1]! + d.z * w[2]!,
        y: d.x * w[4]! + d.y * w[5]! + d.z * w[6]!,
        z: d.x * w[8]! + d.y * w[9]! + d.z * w[10]!,
    }, { x: 0, y: 0, z: distance });
}

describe("focusOn", () => {
    it("moves the camera by the offset to the point and looks at it at once", () => {
        const camera = createArcRotateCamera(0.3, 1.1, 10, { x: 0, y: 0, z: 0 });
        const world = keepWorld(camera);
        const before = getCameraPosition(camera);
        getViewMatrix(camera);
        focusOn(camera, { x: 2, y: 1, z: -3 });
        expectReal(world, { x: before.x + 2, y: before.y + 1, z: before.z - 3 }, { x: 2, y: 1, z: -3 }, 10);
        expect(camera.alpha).toBeCloseTo(0.3, 10);
        expect(camera.beta).toBeCloseTo(1.1, 10);
        expect(camera.radius).toBeCloseTo(10, 10);
        expectNear(getCameraPosition(camera), { x: before.x + 2, y: before.y + 1, z: before.z - 3 });
        expectNear(inView(camera, { x: 2, y: 1, z: -3 }), { x: 0, y: 0, z: 10 });
    });

    it("works call after call, and keeps orbiting the point when the angles change", () => {
        const camera = createArcRotateCamera(-1, 0.8, 6, { x: 1, y: 1, z: 1 });
        const world = keepWorld(camera);
        getCameraPosition(camera);
        const point = { x: 2, y: 0, z: 0 };
        focusOn(camera, point);
        getCameraPosition(camera);
        point.x = -4;
        point.z = 5;
        focusOn(camera, point);
        const fresh = createArcRotateCamera(-1, 0.8, 6, { x: -4, y: 0, z: 5 });
        expectNear(getCameraPosition(camera), getCameraPosition(fresh));
        expectNear(inView(camera, { x: -4, y: 0, z: 5 }), { x: 0, y: 0, z: 6 });
        expectReal(world, getCameraPosition(fresh), { x: -4, y: 0, z: 5 }, 6);

        camera.alpha = 0.5;
        camera.radius = 3;
        const moved = createArcRotateCamera(0.5, 0.8, 3, { x: -4, y: 0, z: 5 });
        expectNear(getCameraPosition(camera), getCameraPosition(moved));
        expectNear(inView(camera, { x: -4, y: 0, z: 5 }), { x: 0, y: 0, z: 3 });
        expectReal(world, getCameraPosition(moved), { x: -4, y: 0, z: 5 }, 3);

        camera.beta = 1.3;
        const turned = createArcRotateCamera(0.5, 1.3, 3, { x: -4, y: 0, z: 5 });
        expectReal(world, getCameraPosition(turned), { x: -4, y: 0, z: 5 }, 3);
    });
    it("makes the point the library's own centre, so the library's controls keep the camera on it", () => {
        // The viewer orbits with the library's orbit camera and its controls. The centre the camera orbits is
        // its own target; the library's pan writes to that target and the camera must follow.
        const canvas = makeCanvas();
        const scene = makeScene();
        const camera = createArcRotateCamera(0.3, 1.1, 10, { x: 0, y: 0, z: 0 });
        const world = keepWorld(camera);
        attachControl(camera, asCanvas(canvas), scene);
        tick(scene);
        const point = { x: 2, y: 1, z: -3 };
        focusOn(camera, point);
        expect([camera.target.x, camera.target.y, camera.target.z]).toEqual([2, 1, -3]);
        const at = (): V => getCameraPosition(createArcRotateCamera(camera.alpha, camera.beta, camera.radius,
            { x: camera.target.x, y: camera.target.y, z: camera.target.z }));
        expectReal(world, at(), point, 10);
        // A right-drag pans with the library's default controls, and its glide runs out.
        fire(canvas, "pointerdown", pointer({ button: 2, buttons: 2, clientX: 100, clientY: 100 }));
        for (let i = 1; i <= 10; i++) {
            fire(canvas, "pointermove", pointer({ button: 2, buttons: 2, clientX: 100 + 10 * i, clientY: 100 + 4 * i }));
            tick(scene);
            const w = world();
            expectNear({ x: w[12]!, y: w[13]!, z: w[14]! }, at());
        }
        fire(canvas, "pointerup", pointer({ button: 2, buttons: 0, clientX: 200, clientY: 140 }));
        tick(scene, 100);
        const centre = { x: camera.target.x, y: camera.target.y, z: camera.target.z };
        expect(Math.hypot(centre.x - 2, centre.y - 1, centre.z + 3)).toBeGreaterThan(0.05);
        expectReal(world, at(), centre, 10);
    });
});
