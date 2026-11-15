import { it, expect } from "vitest";
import { createArcRotateCamera, enableOrthographicCamera, disableOrthographicCamera } from "@babylonjs/lite";

it("n26: enabling again after disable starts from fresh bounds; the old object no longer drives the camera", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const first = enableOrthographicCamera(cam, { halfHeight: 5, left: -3 });
    disableOrthographicCamera(cam);
    expect(cam.ortho).toBeNull();
    const second = enableOrthographicCamera(cam);
    expect(second.halfHeight).toBe(1);
    expect(second.left).toBeNull();
    expect(second).not.toBe(first);
    expect(cam.ortho).toBe(second);
});
