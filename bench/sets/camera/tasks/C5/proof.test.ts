import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createArcRotateCamera, interpolateArcRotateCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

const expected = JSON.parse(readFileSync(new URL("./C5.expected.json", import.meta.url), "utf8")) as {
    rejects: boolean;
    finalRadius: number;
    finalTargetX: number;
};

describe("C5: code that runs right after a transition starts", () => {
    it("matches the library", async () => {
        const scene = makeScene();
        const camera = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });

        const spot = { x: 1, y: 0, z: 0 };
        const done = interpolateArcRotateCamera(camera, scene, { alpha: 1, target: spot });
        camera.radius = 7;
        spot.x = 5;

        let settled: "resolved" | "rejected" | undefined;
        done.then(
            () => (settled = "resolved"),
            () => (settled = "rejected")
        );
        for (let frame = 0; frame < 2000 && settled === undefined; frame++) {
            tick(scene);
            await Promise.resolve();
            await Promise.resolve();
        }
        expect(settled).toBeDefined();
        expect(settled === "rejected").toBe(expected.rejects);
        expect(camera.radius).toBeCloseTo(expected.finalRadius, 6);
        expect(camera.target.x).toBeCloseTo(expected.finalTargetX, 6);
    });
});
