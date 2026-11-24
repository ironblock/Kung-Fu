import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createNullEngine, createSceneContext, runFrameInterpolation, stepScene } from "@babylonjs/lite";

// Run from app/ with this file at app/checks/AG8.proof.test.ts; expected.json is read from tasks/AG8/.
const expected = JSON.parse(readFileSync(resolve(import.meta.dirname, "../../tasks/AG8/expected.json"), "utf8")) as {
    zeroMsFrame: number;
    negativeFrame: number;
    oneMsFrame: number;
    fortyMsFrame: number;
};

/** The step function's argument for one scene frame of the given delta, times 1000, rounded to two decimals. */
async function stepFor(deltaMs: number): Promise<number> {
    const engine = createNullEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    const seen: number[] = [];
    const done = runFrameInterpolation(scene, (deltaSeconds) => {
        seen.push(deltaSeconds);
        return false; // one frame only
    });
    stepScene(engine, scene, deltaMs);
    await done;
    expect(seen).toHaveLength(1);
    return Math.round(seen[0]! * 1000 * 100) / 100;
}

describe("AG8 proof: the time step runFrameInterpolation hands its step", () => {
    it("zeroMsFrame", async () => {
        expect(await stepFor(0)).toBe(expected.zeroMsFrame);
    });
    it("negativeFrame", async () => {
        expect(await stepFor(-5)).toBe(expected.negativeFrame);
    });
    it("oneMsFrame", async () => {
        expect(await stepFor(1)).toBe(expected.oneMsFrame);
    });
    it("fortyMsFrame", async () => {
        expect(await stepFor(40)).toBe(expected.fortyMsFrame);
    });
});
