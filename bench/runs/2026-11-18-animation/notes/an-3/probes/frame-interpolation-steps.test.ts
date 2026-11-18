import { expect, it } from "vitest";
import { runFrameInterpolation } from "@babylonjs/lite";
import { makeScene, tick } from "#helpers";

it("step runs on later scene frames with seconds (1/60 for a delta <= 0); returning false or undefined resolves it", async () => {
    const scene = makeScene();
    const seen: number[] = [];
    const done = runFrameInterpolation(scene, (dt) => {
        seen.push(dt);
        return seen.length < 3;
    });
    expect(seen).toEqual([]);
    tick(scene, 1, 16);
    tick(scene, 1, 0);
    tick(scene, 1, -5);
    tick(scene, 1, 16);
    await done;
    expect(seen).toEqual([0.016, 1 / 60, 1 / 60]);

    let calls = 0;
    const once = runFrameInterpolation(scene, (() => {
        calls++;
    }) as unknown as (dt: number) => boolean);
    tick(scene, 3, 16);
    await once;
    expect(calls).toBe(1);
});
