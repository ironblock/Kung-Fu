import { expect, test } from "vitest";
import { createArcRotateCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

test("projectWorldToScreen throws RangeError on a zero viewport or backing size, or on only one of cssWidth/cssHeight", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const v = getViewMatrix(cam);
    const vp = getViewProjectionMatrix(cam, 1);
    const ok = { viewport: { x: 0, y: 0, width: 100, height: 100 }, backingWidth: 100, backingHeight: 100 };
    expect(() => projectWorldToScreen({ x: 0, y: 0, z: 0 }, v, vp, ok)).not.toThrow();
    expect(() => projectWorldToScreen({ x: 0, y: 0, z: 0 }, v, vp, { ...ok, viewport: { x: 0, y: 0, width: 0, height: 100 } })).toThrow(RangeError);
    expect(() => projectWorldToScreen({ x: 0, y: 0, z: 0 }, v, vp, { ...ok, backingWidth: 0 })).toThrow(RangeError);
    expect(() => projectWorldToScreen({ x: 0, y: 0, z: 0 }, v, vp, { ...ok, cssWidth: 50 })).toThrow(RangeError);
});
