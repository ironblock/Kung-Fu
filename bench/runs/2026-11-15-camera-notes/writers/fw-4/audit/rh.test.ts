import { describe, expect, it, vi } from "vitest";
import { fileURLToPath } from "node:url";
import { makeCanvas, asCanvas, fire, pointer, key, tick } from "./helpers";

const SRC = fileURLToPath(new URL("../../babylon-lite/packages/babylon-lite/src/", import.meta.url));
const SEAM = `${SRC}engine/coordinate-system`;

async function build(rh: boolean) {
    vi.resetModules();
    if (rh) vi.doMock(SEAM, () => import(`${SEAM}-rh`));
    else vi.doUnmock(SEAM);
    return import("@babylonjs/lite");
}

async function screenDx(rh: boolean, kind: "arcRotate" | "arcPan" | "free") {
    const L = await build(rh);
    const scene = L.createSceneContext(L.createNullEngine(), { defaultRenderTask: false });
    const cv = makeCanvas();
    // probe point: world point in front of camera, project to screen x before and after a +x drag
    let camera: any;
    if (kind === "free") {
        camera = L.createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
        L.attachFreeControl(camera, asCanvas(cv), scene);
    } else {
        camera = L.createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        L.attachControl(camera, asCanvas(cv), scene);
    }
    const P = { x: 1, y: 0.5, z: 0.3 };
    const sx = () => {
        const v = L.getViewMatrix(camera);
        const vp = L.getViewProjectionMatrix(camera, 1);
        return L.projectWorldToScreen(P, v, vp, { viewport: { x: 0, y: 0, width: 100, height: 100 }, backingWidth: 100, backingHeight: 100 }).x;
    };
    const x0 = sx();
    const btn = kind === "arcPan" ? 2 : 0;
    fire(cv, "pointerdown", pointer({ button: btn }));
    fire(cv, "pointermove", pointer({ button: btn, clientX: 30 }));
    fire(cv, "pointerup", pointer({ button: btn }));
    tick(scene, 1);
    const alphaOrYaw = kind === "free" ? camera._yaw : camera.alpha;
    return { dx: sx() - x0, alphaOrYaw, tx: kind === "arcPan" ? camera.target.x : 0 };
}

describe("n56 right-handed build flips alpha/yaw and horizontal pan so drags turn the same on screen", () => {
    for (const kind of ["arcRotate", "arcPan", "free"] as const) {
        it(kind, async () => {
            const lh = await screenDx(false, kind);
            const rh = await screenDx(true, kind);
            expect(Math.sign(lh.dx)).toBe(Math.sign(rh.dx));
            expect(Math.abs(lh.dx)).toBeGreaterThan(1e-6);
            if (kind !== "arcPan") {
                const base = kind === "free" ? 0 : -Math.PI / 2;
                expect(Math.sign(lh.alphaOrYaw - base)).toBe(-Math.sign(rh.alphaOrYaw - base));
            }
        });
    }
});
