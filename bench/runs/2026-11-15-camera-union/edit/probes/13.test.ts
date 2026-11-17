import { it, expect } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

const R = 1000;

it("13a: default limits: pitch free (up to pitchMax) at radius <= 2R, pitchMin at >= 4R, linear between", () => {
    const cam = createGeospatialCamera({ planetRadius: R });
    setGeospatialOrientation(cam, { radius: 2 * R, pitch: 1.5 });
    expect(cam.pitch).toBe(1.5);
    setGeospatialOrientation(cam, { radius: 2 * R, pitch: 1.6 });
    expect(cam.pitch).toBeCloseTo(Math.PI / 2 - 0.01, 12);
    setGeospatialOrientation(cam, { radius: 3 * R, pitch: 1.5 });
    expect(cam.pitch).toBeCloseTo(((Math.PI / 2 - 0.01) + 0.001) / 2, 12);
    setGeospatialOrientation(cam, { radius: 4 * R, pitch: 1.5 });
    expect(cam.pitch).toBe(0.001);
});

it("13b: the camera starts at 4R, so pitch set before radius stays at pitchMin", () => {
    const cam = createGeospatialCamera({ planetRadius: R });
    expect(cam.radius).toBe(4 * R);
    cam.pitch = 1;
    cam.radius = 500;
    expect(cam.pitch).toBe(0.001);
    cam.pitch = 1;
    expect(cam.pitch).toBe(1);
    const cam2 = createGeospatialCamera({ planetRadius: R });
    setGeospatialOrientation(cam2, { pitch: 1, radius: 500 });
    expect(cam2.pitch).toBe(1);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

it("13c (after check): a planet with 4*planetRadius < 10 starts at radius 10", () => {
    expect(L.createGeospatialCamera({ planetRadius: 1 }).radius).toBe(10);
    expect(L.createGeospatialCamera({ planetRadius: 1000 }).radius).toBe(4000);
});

