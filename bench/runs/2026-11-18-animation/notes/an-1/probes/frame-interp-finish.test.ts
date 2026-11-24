// Note: after step returns false it is not called again and the promise resolves on a later microtask; if step throws, the promise rejects with an Error, a thrown string wrapped.
import { expect, it } from "vitest";
import { runFrameInterpolation } from "@babylonjs/lite";
import { makeScene, tick } from "../helpers.js";

it("resolves after the frame", async () => {
    const scene = makeScene();
    let calls = 0;
    let resolved = false;
    const done = runFrameInterpolation(scene, () => ++calls < 2).then(() => {
        resolved = true;
    });
    tick(scene, 2, 16);
    expect(calls).toBe(2);
    expect(resolved).toBe(false);
    await done;
    expect(resolved).toBe(true);
    tick(scene, 3, 16);
    expect(calls).toBe(2);
});

it("rejects on throw", async () => {
    const scene = makeScene();
    const failed = runFrameInterpolation(scene, () => {
        throw "stop";
    });
    tick(scene, 1, 16);
    const error = await failed.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("stop");
});
