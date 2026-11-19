import { expect, test } from "vitest";
import { createNullEngine, createSceneContext, runFrameInterpolation, stepScene } from "@babylonjs/lite";

test("runFrameInterpolation whose step throws a string, whose signal aborts, or whose signal was already aborted", async () => {
    const engine = createNullEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    const frame = () => stepScene(engine, scene, 16);
    let thrown = 0;
    const p = runFrameInterpolation(scene, () => { thrown++; throw "text"; });
    frame();
    frame();
    await expect(p).rejects.toEqual(new Error("text"));
    expect(thrown).toBe(1);
    const late = new AbortController();
    let lateCalls = 0;
    const q = runFrameInterpolation(scene, () => (lateCalls++, true), late.signal);
    frame();
    late.abort(new Error("stop"));
    frame();
    await expect(q).rejects.toBe(late.signal.reason);
    expect(lateCalls).toBe(1);
    const early = new AbortController();
    early.abort(new Error("early"));
    let earlyCalls = 0;
    const r = runFrameInterpolation(scene, () => (earlyCalls++, true), early.signal);
    frame();
    await expect(r).rejects.toBe(early.signal.reason);
    expect(earlyCalls).toBe(0);
});
