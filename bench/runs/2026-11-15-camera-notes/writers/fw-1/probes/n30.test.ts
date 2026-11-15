import { it, expect } from "vitest";
import { createArcRotateCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen, projectPointToViewportToRef } from "@babylonjs/lite";

it("n30: projectWorldToScreen throws RangeError on an empty viewport or a lone cssWidth; projectPointToViewportToRef accepts it", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const v = getViewMatrix(cam);
    const vp = getViewProjectionMatrix(cam, 1);
    const empty = { x: 0, y: 0, width: 0, height: 0 };
    expect(() => projectWorldToScreen({ x: 0, y: 0, z: 0 }, v, vp, { viewport: empty, backingWidth: 100, backingHeight: 100 })).toThrow(RangeError);
    expect(() =>
        projectWorldToScreen({ x: 0, y: 0, z: 0 }, v, vp, { viewport: { x: 0, y: 0, width: 100, height: 100 }, backingWidth: 100, backingHeight: 100, cssWidth: 50 })
    ).toThrow(RangeError);
    const identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) as unknown as Parameters<typeof projectPointToViewportToRef>[1];
    const r = projectPointToViewportToRef({ x: 0, y: 0, z: 0 }, identity, vp, empty, { x: 0, y: 0, z: 0 });
    expect(r.x).toBe(0);
});
