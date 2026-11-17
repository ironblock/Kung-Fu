import { it, expect } from "vitest";
import { createFreeCamera, createArcRotateCamera, getCameraPosition } from "@babylonjs/lite";

it("73: getCameraPosition reads the world matrix translation, parent transform included", () => {
    const parent = createFreeCamera({ x: 100, y: 0, z: 0 }, { x: 100, y: 0, z: 1 }); // identity rotation, translated
    const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    const local = getCameraPosition(cam);
    expect(local.x).toBeCloseTo(10, 6);
    cam.parent = parent;
    const p = getCameraPosition(cam);
    expect(p.x).toBeCloseTo(110, 4);
    expect(p.z).toBeCloseTo(local.z, 4);
});
