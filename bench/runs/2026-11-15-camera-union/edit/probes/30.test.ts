import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

function pan(alpha: number, beta: number, px: number, py: number) {
    const scene = H2.makeScene();
    const cam = L2.createArcRotateCamera(alpha, beta, 10, { x: 0, y: 0, z: 0 });
    L2.attachControl(cam, H2.asCanvas(H2.makeCanvas()), scene);
    cam.inertialPanningX = px;
    cam.inertialPanningY = py;
    H2.tick(scene);
    return [cam.target.x, cam.target.y, cam.target.z];
}

V2.it("30 (after check 2): inertialPanningY moves the target along the up vector; outside (0, PI) the moves flip, use 0.0001, or go along world axes", () => {
    const a = 0.7, b = 1.1, s = 10 / 1000;
    const up = pan(a, b, 0, 1);
    V2.expect(up[0]).toBeCloseTo(-Math.cos(a) * Math.cos(b) * s, 12);
    V2.expect(up[1]).toBeCloseTo(Math.sin(b) * s, 12);
    V2.expect(up[2]).toBeCloseTo(-Math.sin(a) * Math.cos(b) * s, 12);
    // sin(beta) < 0: both moves flip sign
    const bn = -0.5;
    const nx = pan(a, bn, 1, 0), ny = pan(a, bn, 0, 1);
    V2.expect(nx[0]).toBeCloseTo(Math.sin(a) * s, 12);
    V2.expect(nx[2]).toBeCloseTo(-Math.cos(a) * s, 12);
    V2.expect(ny[1]).toBeCloseTo(-Math.sin(bn) * s, 12);
    V2.expect(ny[0]).toBeCloseTo(Math.cos(a) * Math.cos(bn) * s, 12);
    // beta 0: sin(beta) counts as 0.0001
    const z = pan(a, 0, 0, 1);
    V2.expect(z[1]).toBeCloseTo(0.0001 * s, 15);
    V2.expect(z[0]).toBeCloseTo(-Math.cos(a) * s, 12);
    // beta PI: along world +X and +Y
    V2.expect(pan(a, Math.PI, 1, 0)).toEqual([s, 0, 0]);
    V2.expect(pan(a, Math.PI, 0, 1)).toEqual([0, s, 0]);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("30 (after check 3): at beta 2*PI and -PI (|sin| < 1e-10) the pans go along world +X/+Y; beta 0 is not that case", () => {
    function panAt(beta: number) {
        const scene = H3.makeScene();
        const cam = L3.createArcRotateCamera(0, beta, 10, { x: 0, y: 0, z: 0 });
        L3.attachControl(cam, H3.asCanvas(H3.makeCanvas()), scene);
        cam.inertialPanningX = 1;
        cam.inertialPanningY = 1;
        H3.tick(scene, 1);
        return { x: cam.target.x, y: cam.target.y, z: cam.target.z };
    }
    for (const b of [2 * Math.PI, -Math.PI]) {
        const t = panAt(b);
        V3.expect(t.x).toBeCloseTo(0.01, 9);
        V3.expect(t.y).toBeCloseTo(0.01, 9);
        V3.expect(t.z).toBeCloseTo(0, 9);
    }
    const t0 = panAt(0);
    V3.expect(t0.z).toBeCloseTo(0.01, 6); // along the right vector (0, 0, 1) at alpha 0
});
