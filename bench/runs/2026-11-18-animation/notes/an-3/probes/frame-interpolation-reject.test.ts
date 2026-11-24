import { expect, it } from "vitest";
import { runFrameInterpolation } from "@babylonjs/lite";
import { makeScene, tick } from "#helpers";

it("a throwing step rejects with an Error (non-Errors wrapped); an abort rejects with the signal's reason and stops the steps", async () => {
    const scene = makeScene();
    const thrown = runFrameInterpolation(scene, () => {
        throw "boom";
    });
    tick(scene, 1, 16);
    const error = await thrown.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("boom");

    const controller = new AbortController();
    let calls = 0;
    const aborted = runFrameInterpolation(scene, () => {
        calls++;
        return true;
    }, controller.signal);
    tick(scene, 2, 16);
    controller.abort();
    tick(scene, 2, 16);
    const reason = await aborted.catch((e: unknown) => e);
    expect(reason).toBe(controller.signal.reason);
    expect((reason as Error).name).toBe("AbortError");
    expect(calls).toBe(2);
});
