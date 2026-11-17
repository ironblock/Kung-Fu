import { it, expect } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

it("31a: start pose, planes and limits", () => {
    const R = 5000;
    const cam = createGeospatialCamera({ planetRadius: R });
    expect({ ...cam.center }).toEqual({ x: R, y: 0, z: 0 });
    expect(cam.yaw).toBe(0);
    expect(cam.pitch).toBe(0.001);
    expect(cam.radius).toBe(4 * R);
    expect(cam.nearPlane).toBe(1);
    expect(cam.farPlane).toBe(16 * R);
    expect(cam.limits.radiusMin).toBe(10);
    expect(cam.limits.radiusMax).toBe(4 * R);
    cam.radius = 5;
    expect(cam.radius).toBe(10);
    cam.radius = 1e9;
    expect(cam.radius).toBe(4 * R);
    expect(createGeospatialCamera({ planetRadius: 100 }).limits.radiusMin).toBe(10);
});

it("31b: if 4R < 10 it starts at 10; a write above 10 gives 4R, below 10 gives 10", () => {
    const cam = createGeospatialCamera({ planetRadius: 1 });
    expect(cam.radius).toBe(10);
    cam.radius = 11;
    expect(cam.radius).toBe(4);
    cam.radius = 2;
    expect(cam.radius).toBe(10);
    cam.radius = 10.5;
    expect(cam.radius).toBe(4);
    cam.radius = 9.5;
    expect(cam.radius).toBe(10);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

it("31c (after check): default pitchMin 0.001 and pitchMax PI/2-0.01", () => {
    const cam = L.createGeospatialCamera({ planetRadius: 1000 });
    expect(cam.limits.pitchMin).toBe(0.001);
    expect(cam.limits.pitchMax).toBe(Math.PI / 2 - 0.01);
    cam.radius = 500;
    cam.pitch = 3;
    expect(cam.pitch).toBe(Math.PI / 2 - 0.01);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("31 (after check 3): the start radius is 10 when 4*planetRadius is smaller", () => {
    V3.expect(L3.createGeospatialCamera({ planetRadius: 2 }).radius).toBe(10);
    V3.expect(L3.createGeospatialCamera({ planetRadius: 3 }).radius).toBe(12);
});
