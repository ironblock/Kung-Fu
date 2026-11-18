import { expect, it } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import { focusOn } from "../src/focus";

// Read the camera's real state: its own target object and its own worldMatrix getter, kept before the call.
it("A1 real state follows the point", () => {
    const camera = createArcRotateCamera(0.3, 1.1, 10, { x: 0, y: 0, z: 0 });
    const ownWm = Object.getOwnPropertyDescriptor(camera, "worldMatrix")!.get!.bind(camera);
    const ownTarget = camera.target;
    const eye = (): number[] => { const m = ownWm(); return [m[12]!, m[13]!, m[14]!]; };
    const descs = Object.getOwnPropertyDescriptors(camera);
    const before = eye();
    focusOn(camera, { x: 2, y: 1, z: -3 });
    const after = eye();
    const fresh = createArcRotateCamera(0.3, 1.1, 10, { x: 2, y: 1, z: -3 });
    const want = [fresh.worldMatrix[12]!, fresh.worldMatrix[13]!, fresh.worldMatrix[14]!];
    const replaced = Object.keys(descs).filter((k) => { const d = Object.getOwnPropertyDescriptor(camera, k); return !d || d.get !== descs[k]!.get || d.set !== descs[k]!.set; });
    console.log("PROBE before", before.map((v) => v.toFixed(3)).join(","), "real eye after", after.map((v) => v.toFixed(3)).join(","),
        "want", want.map((v) => v.toFixed(3)).join(","), "real target", ownTarget.x, ownTarget.y, ownTarget.z,
        "camera.target same object", camera.target === ownTarget, "suspect", replaced.join(","));
    expect(after[0]).toBeCloseTo(want[0]!, 4);
    expect(after[1]).toBeCloseTo(want[1]!, 4);
    expect(after[2]).toBeCloseTo(want[2]!, 4);
    camera.alpha = 0.5;
    const moved = createArcRotateCamera(0.5, 1.1, 10, { x: 2, y: 1, z: -3 });
    const m = ownWm();
    expect(m[12]).toBeCloseTo(moved.worldMatrix[12]!, 4);
    expect(m[14]).toBeCloseTo(moved.worldMatrix[14]!, 4);
});
