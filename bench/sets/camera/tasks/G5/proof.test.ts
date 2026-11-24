import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";

const expected = JSON.parse(readFileSync(resolve(import.meta.dirname, "G5.expected.json"), "utf8")) as Record<string, number>;

function tightened(): GeospatialCamera {
    const camera = createGeospatialCamera({ planetRadius: 1000 });
    expect(camera.radius).toBe(4000);
    camera.limits.radiusMax = 2000;
    return camera;
}

describe("G5 when a tighter radiusMax takes effect", () => {
    it("asIs", () => {
        const camera = tightened();
        expect(camera.radius).toBeCloseTo(expected.asIs!, 6);
    });
    it("radiusSelf", () => {
        const camera = tightened();
        camera.radius = camera.radius;
        expect(camera.radius).toBeCloseTo(expected.radiusSelf!, 6);
    });
    it("centerSelf", () => {
        const camera = tightened();
        camera.center = camera.center;
        expect(camera.radius).toBeCloseTo(expected.centerSelf!, 6);
    });
    it("emptyOrientation", () => {
        const camera = tightened();
        setGeospatialOrientation(camera, {});
        expect(camera.radius).toBeCloseTo(expected.emptyOrientation!, 6);
    });
});
