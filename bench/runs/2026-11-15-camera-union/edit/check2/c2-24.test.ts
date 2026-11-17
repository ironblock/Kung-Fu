import { it, expect } from "vitest";
import { createFreeCamera, enableOrthographicCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

it("c2-24: with an orthographic camera a point on the camera plane has clipW 1 and finite x/y, not NaN", () => {
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    enableOrthographicCamera(cam, { halfHeight: 5 });
    const r = projectWorldToScreen({ x: 1, y: 0, z: 0 }, getViewMatrix(cam), getViewProjectionMatrix(cam, 800 / 600), {
        viewport: { x: 0, y: 0, width: 800, height: 600 },
        backingWidth: 800,
        backingHeight: 600,
    });
    expect(r.clipW).toBe(1);
    expect(r.behindCamera).toBe(true);
    expect(Number.isFinite(r.x)).toBe(true);
    expect(Number.isFinite(r.y)).toBe(true);
});
