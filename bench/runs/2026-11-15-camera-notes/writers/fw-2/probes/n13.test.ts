import { describe, it, expect } from "vitest";
import { createGeospatialCamera, flyGeospatialCameraToAsync } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

describe("n13 flyGeospatialCameraToAsync resolves, not rejects, when a later flight interrupts it", () => {
    it("the first flight's promise resolves short of its goal", async () => {
        const scene = makeScene();
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        const r0 = cam.radius;
        let outcome = "pending";
        const first = flyGeospatialCameraToAsync(cam, scene, { radius: 100, durationMs: 1000 }).then(
            () => (outcome = "resolved"),
            () => (outcome = "rejected")
        );
        tick(scene, 3);
        void flyGeospatialCameraToAsync(cam, scene, { yaw: 1, durationMs: 1000 });
        await first;
        expect(outcome).toBe("resolved");
        expect(cam.radius).toBeGreaterThan(100);
        expect(cam.radius).toBeLessThanOrEqual(r0);
    });
});
