import { expect, test } from "vitest";
import { createNullEngine, createSceneContext, runFrameInterpolation, stepScene } from "@babylonjs/lite";

test("runFrameInterpolation on a scene stepped by 20, 0, -5 and 16 ms", async () => {
    const engine = createNullEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    const seen: number[] = [];
    const p = runFrameInterpolation(scene, (dt) => (seen.push(dt), seen.length < 3));
    expect(seen).toEqual([]);
    expect(scene._beforeRender.length).toBe(1);
    for (const d of [20, 0, -5, 16]) stepScene(engine, scene, d);
    expect(seen).toEqual([0.02, 1 / 60, 1 / 60]);
    await expect(p).resolves.toBeUndefined();
    expect(scene._beforeRender.length).toBe(0);
});
