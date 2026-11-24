// Note: an already aborted signal rejects at once with signal.reason as an Error and step never runs; a later abort detaches the driver and rejects.
import { expect, it } from "vitest";
import { runFrameInterpolation } from "@babylonjs/lite";
import { makeScene, tick } from "../helpers.js";

it("pre-aborted", async () => {
    const scene = makeScene();
    const controller = new AbortController();
    controller.abort("cancelled");
    let ran = false;
    const error = await runFrameInterpolation(scene, () => (ran = true), controller.signal).catch((e: unknown) => e);
    tick(scene, 2, 16);
    expect(ran).toBe(false);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("cancelled");
});

it("abort mid-way", async () => {
    const scene = makeScene();
    const controller = new AbortController();
    let calls = 0;
    const run = runFrameInterpolation(scene, () => ++calls > 0, controller.signal);
    tick(scene, 2, 16);
    controller.abort();
    const error = await run.catch((e: unknown) => e);
    tick(scene, 2, 16);
    expect(calls).toBe(2);
    expect((error as Error).name).toBe("AbortError");
});
