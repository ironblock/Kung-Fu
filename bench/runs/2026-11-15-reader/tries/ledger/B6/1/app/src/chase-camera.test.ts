import { describe, expect, it } from "vitest";
import { createChaseCamera } from "./chase-camera.ts";

const near = (a: number[], b: number[]) => {
    for (let i = 0; i < 3; i++) expect(a[i]).toBeCloseTo(b[i]!, 5);
};
// Camera axes are the columns of the world matrix: x = [0..2], y = [4..6], z = [8..10].
const axis = (m: ArrayLike<number>, col: number) => [m[col * 4]!, m[col * 4 + 1]!, m[col * 4 + 2]!];

describe("createChaseCamera", () => {
    it("starts upright and looks at the target", () => {
        const { camera } = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        near(axis(camera.worldMatrix, 1), [0, 1, 0]);
        near(axis(camera.worldMatrix, 2), [0, 0, 1]);
        near([camera.worldMatrix[12]!, camera.worldMatrix[13]!, camera.worldMatrix[14]!], [0, 0, 0]);
    });

    it("rolls so picture-up follows the given up while looking at the target", () => {
        const cc = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        cc.bank({ x: 1, y: 0, z: 0 });
        near(axis(cc.camera.worldMatrix, 1), [1, 0, 0]);
        near(axis(cc.camera.worldMatrix, 2), [0, 0, 1]);
    });

    it("projects a tilted up onto the image plane", () => {
        const cc = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        cc.bank({ x: 1, y: 1, z: 0 }); // not unit length, has a component along the line of sight too
        cc.bank({ x: 1, y: 1, z: 3 });
        const s = Math.SQRT1_2;
        near(axis(cc.camera.worldMatrix, 1), [s, s, 0]);
        near(axis(cc.camera.worldMatrix, 2), [0, 0, 1]);
    });

    it("keeps the previous roll when up points along the line of sight, either way", () => {
        const cc = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        cc.bank({ x: 1, y: 0, z: 0 });
        cc.bank({ x: 0, y: 0, z: 1 });
        cc.bank({ x: 0, y: 0, z: -1 });
        near(axis(cc.camera.worldMatrix, 1), [1, 0, 0]);
        near(axis(cc.camera.worldMatrix, 2), [0, 0, 1]);
    });

    it("stays upright when the first up is parallel to the line of sight", () => {
        const cc = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        cc.bank({ x: 0, y: 0, z: 1 });
        near(axis(cc.camera.worldMatrix, 1), [0, 1, 0]);
    });

    it("treats nearly parallel up as parallel instead of letting noise pick the roll", () => {
        const cc = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        cc.bank({ x: 1, y: 0, z: 0 });
        cc.bank({ x: 1e-13, y: 0, z: 1 });
        near(axis(cc.camera.worldMatrix, 1), [1, 0, 0]);
    });

    it("works on an oblique line of sight and copies its inputs", () => {
        const eye = { x: 1, y: 2, z: 3 };
        const target = { x: 4, y: 2, z: 7 };
        const cc = createChaseCamera(eye, target);
        eye.x = 100;
        target.x = -100;
        cc.bank({ x: 0, y: 1, z: 0 });
        const z = axis(cc.camera.worldMatrix, 2);
        near(z, [3 / 5, 0, 4 / 5]);
        // y-axis is perpendicular to z and has positive dot with world up
        const y = axis(cc.camera.worldMatrix, 1);
        expect(y[0]! * z[0]! + y[1]! * z[1]! + y[2]! * z[2]!).toBeCloseTo(0, 6);
        expect(y[1]!).toBeGreaterThan(0);
    });
});
