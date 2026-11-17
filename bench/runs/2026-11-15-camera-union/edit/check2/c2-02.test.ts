import { it, expect } from "vitest";
import { createArcRotateCamera, setCameraLimits } from "@babylonjs/lite";

it("c2-02: a lower radius limit above the upper one makes setCameraLimits overflow the stack instead of clamping", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    expect(() => setCameraLimits(cam, { lowerRadiusLimit: 5, upperRadiusLimit: 3 })).toThrow(RangeError);
});

it("c2-02b: the same crossed limits set by hand before setCameraLimits overflow at the next write", () => {
    const cam = createArcRotateCamera(1, 1, 4, { x: 0, y: 0, z: 0 });
    setCameraLimits(cam, {});
    cam.lowerBetaLimit = 2;
    cam.upperBetaLimit = 1;
    expect(() => { cam.beta = 1.5; }).toThrow(RangeError);
});
