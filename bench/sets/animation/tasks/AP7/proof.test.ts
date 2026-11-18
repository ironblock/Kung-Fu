import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const expected = JSON.parse(readFileSync(new URL("./AP7.expected.json", import.meta.url), "utf8")) as {
    orientationIsRotation: boolean;
    orientationHalfwayW: number;
    rotationQuaternionIsRotation: boolean;
    nestedRotationQuaternionIsRotation: boolean;
    falseOptionMakesRotationQuaternionPlain: boolean;
};

type Quat = { x: number; y: number; z: number; w: number };

/** Plays the four-number track on `path` for 0.5 s and returns what it wrote. */
function halfway(path: string, quaternion?: boolean): Quat {
    const manager = createAnimationManager();
    const target = {
        orientation: { x: 0, y: 0, z: 0, w: 1 },
        rotationQuaternion: { x: 0, y: 0, z: 0, w: 1 },
        node: { rotationQuaternion: { x: 0, y: 0, z: 0, w: 1 } },
    };
    const clip = createPropertyAnimationClip("four", [
        {
            path,
            ...(quaternion === undefined ? {} : { quaternion }),
            keys: [
                { time: 0, value: [0, 0, 0, 1] },
                { time: 1, value: [0, 1, 0, 0] },
            ],
        },
    ]);
    createPropertyAnimationGroup(manager, target, clip, { loop: false });
    for (let i = 0; i < 5; i++) {
        updateAnimationManager(manager, 100);
    }
    return path.split(".").reduce<unknown>((value, part) => (value as Record<string, unknown>)[part], target) as Quat;
}

// Half-way between identity and a half turn about y: spherical gives (0, 0.7071, 0, 0.7071), component by component gives (0, 0.5, 0, 0.5).
function isSpherical(q: Quat): boolean {
    return Math.abs(q.y - Math.SQRT1_2) < 1e-4 && Math.abs(q.w - Math.SQRT1_2) < 1e-4 && Math.abs(q.x) < 1e-6 && Math.abs(q.z) < 1e-6;
}
function isComponentwise(q: Quat): boolean {
    return Math.abs(q.y - 0.5) < 1e-4 && Math.abs(q.w - 0.5) < 1e-4 && Math.abs(q.x) < 1e-6 && Math.abs(q.z) < 1e-6;
}
function kind(q: Quat): "spherical" | "componentwise" {
    expect(isSpherical(q) !== isComponentwise(q)).toBe(true);
    return isSpherical(q) ? "spherical" : "componentwise";
}

describe("AP7 four-number tracks", () => {
    it("orientationIsRotation and orientationHalfwayW", () => {
        const q = halfway("orientation");
        expect(kind(q) === "spherical").toBe(expected.orientationIsRotation);
        expect(q.w).toBeCloseTo(expected.orientationHalfwayW, 4);
    });

    it("rotationQuaternionIsRotation", () => {
        expect(kind(halfway("rotationQuaternion")) === "spherical").toBe(expected.rotationQuaternionIsRotation);
    });

    it("nestedRotationQuaternionIsRotation", () => {
        expect(kind(halfway("node.rotationQuaternion")) === "spherical").toBe(expected.nestedRotationQuaternionIsRotation);
    });

    it("falseOptionMakesRotationQuaternionPlain", () => {
        expect(kind(halfway("rotationQuaternion", false)) === "componentwise").toBe(expected.falseOptionMakesRotationQuaternionPlain);
    });
});
