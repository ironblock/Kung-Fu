import { describe, expect, it } from "vitest";
import { getViewMatrix } from "@babylonjs/lite";
import { createChaseCamera } from "./chase-camera.ts";

const close = (a: number, b: number, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

/** Camera picture-up in world space: column 1 of the camera's world matrix. */
function pictureUp(cam: { worldMatrix: ArrayLike<number> }) {
    const w = cam.worldMatrix;
    return { x: w[4]!, y: w[5]!, z: w[6]! };
}
/** Camera line of sight in world space: column 2 of the world matrix. */
function sight(cam: { worldMatrix: ArrayLike<number> }) {
    const w = cam.worldMatrix;
    return { x: w[8]!, y: w[9]!, z: w[10]! };
}

describe("createChaseCamera", () => {
    it("starts upright and looks at the target", () => {
        const { camera } = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const up = pictureUp(camera);
        close(up.x, 0);
        close(up.y, 1);
        close(up.z, 0);
        const s = sight(camera);
        close(s.z, 1);
    });

    it("rolls so picture-up matches a banked up while still looking at the target", () => {
        const { camera, bank } = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        bank({ x: 1, y: 0, z: 0 });
        const up = pictureUp(camera);
        close(up.x, 1);
        close(up.y, 0);
        close(up.z, 0);
        const s = sight(camera);
        close(s.z, 1);
    });

    it("projects a tilted up onto the picture plane", () => {
        const { camera, bank } = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const n = Math.SQRT1_2;
        bank({ x: n, y: n, z: 0 }); // 45 degrees of roll, still perpendicular to sight
        const up = pictureUp(camera);
        close(up.x, n);
        close(up.y, n);
        close(up.z, 0);
    });

    it("keeps the previous roll when up is exactly along the line of sight, either way", () => {
        const { camera, bank } = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        bank({ x: 1, y: 0, z: 0 });
        const before = pictureUp(camera);
        bank({ x: 0, y: 0, z: 1 });
        const after = pictureUp(camera);
        close(after.x, before.x);
        close(after.y, before.y);
        close(after.z, before.z);
        const s = sight(camera);
        close(s.z, 1);
        bank({ x: 0, y: 0, z: -1 });
        const after2 = pictureUp(camera);
        close(after2.x, before.x);
        close(after2.y, before.y);
        close(after2.z, before.z);
    });

    it("re-rolls after a parallel call when the car's up comes back", () => {
        const { camera, bank } = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        bank({ x: 0, y: 0, z: 1 });
        bank({ x: 0, y: -1, z: 0 });
        const up = pictureUp(camera);
        close(up.x, 0);
        close(up.y, -1);
        close(up.z, 0);
    });

    it("bumps the view matrix when the roll changes", () => {
        const { camera, bank } = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const v0 = Array.from(getViewMatrix(camera));
        bank({ x: 1, y: 0, z: 0 });
        const v1 = Array.from(getViewMatrix(camera));
        expect(v1).not.toEqual(v0);
    });

    it("does not move the view on a parallel call", () => {
        const { camera, bank } = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        bank({ x: 1, y: 0, z: 0 });
        const v0 = Array.from(getViewMatrix(camera));
        bank({ x: 0, y: 0, z: 1 });
        const v1 = Array.from(getViewMatrix(camera));
        v0.forEach((v, i) => close(v1[i]!, v));
    });
});
