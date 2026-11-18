// Note: runFrameInterpolation passes step the frame delta in seconds; a delta of 0 or less becomes 1/60 s; step first runs on the next frame, not at the call.
import { expect, it } from "vitest";
import { runFrameInterpolation } from "@babylonjs/lite";
import { makeScene, tick } from "../helpers.js";

it("seconds, next frame", () => {
    const scene = makeScene();
    const deltas: number[] = [];
    void runFrameInterpolation(scene, (dt) => {
        deltas.push(dt);
        return true;
    });
    expect(deltas).toEqual([]);
    tick(scene, 1, 16);
    tick(scene, 1, 0);
    tick(scene, 1, -5);
    expect(deltas).toEqual([0.016, 1 / 60, 1 / 60]);
});
