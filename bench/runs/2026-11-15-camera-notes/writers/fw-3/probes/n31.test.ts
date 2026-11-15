import { expect, test } from "vitest";
import { createArcRotateCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

test("projectWorldToScreen: x/y are backing pixels from the canvas top-left including viewport offset; css = backing * css/backing", () => {
    const cam = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    const r = projectWorldToScreen({ x: 0, y: 0, z: 0 }, getViewMatrix(cam), getViewProjectionMatrix(cam, 1), {
        viewport: { x: 100, y: 50, width: 200, height: 200 },
        backingWidth: 800,
        backingHeight: 600,
        cssWidth: 400,
        cssHeight: 300,
    });
    expect(r.x).toBeCloseTo(200, 6);
    expect(r.y).toBeCloseTo(150, 6);
    expect(r.cssX).toBeCloseTo(100, 6);
    expect(r.cssY).toBeCloseTo(75, 6);
    // a point above the target lands higher on screen: smaller y
    const up = projectWorldToScreen({ x: 0, y: 1, z: 0 }, getViewMatrix(cam), getViewProjectionMatrix(cam, 1), {
        viewport: { x: 0, y: 0, width: 200, height: 200 }, backingWidth: 200, backingHeight: 200,
    });
    expect(up.y).toBeLessThan(100);
});
