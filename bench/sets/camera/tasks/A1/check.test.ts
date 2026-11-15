import { describe, expect, it } from "vitest";
import { createArcRotateCamera, getCameraPosition, getViewMatrix } from "@babylonjs/lite";
import type { ArcRotateCamera } from "@babylonjs/lite";
import { focusOn } from "../src/focus";

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

describe("focusOn", () => {
    it("moves the camera by the offset to the point and looks at it at once", () => {
        const camera = createArcRotateCamera(0.3, 1.1, 10, { x: 0, y: 0, z: 0 });
        const before = getCameraPosition(camera);
        getViewMatrix(camera);
        focusOn(camera, { x: 2, y: 1, z: -3 });
        expect(camera.alpha).toBeCloseTo(0.3, 10);
        expect(camera.beta).toBeCloseTo(1.1, 10);
        expect(camera.radius).toBeCloseTo(10, 10);
        expectNear(getCameraPosition(camera), { x: before.x + 2, y: before.y + 1, z: before.z - 3 });
        expectNear(inView(camera, { x: 2, y: 1, z: -3 }), { x: 0, y: 0, z: 10 });
    });

    it("works call after call, and keeps orbiting the point when the angles change", () => {
        const camera = createArcRotateCamera(-1, 0.8, 6, { x: 1, y: 1, z: 1 });
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

        camera.alpha = 0.5;
        camera.radius = 3;
        const moved = createArcRotateCamera(0.5, 0.8, 3, { x: -4, y: 0, z: 5 });
        expectNear(getCameraPosition(camera), getCameraPosition(moved));
        expectNear(inView(camera, { x: -4, y: 0, z: 5 }), { x: 0, y: 0, z: 3 });
    });
});
