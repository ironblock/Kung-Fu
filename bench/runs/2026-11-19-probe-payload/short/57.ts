import { expect, test } from "vitest";
import { createNullEngine, createSceneContext, runFrameInterpolation, stepScene } from "@babylonjs/lite";

test("a step that returns false on its second call, and a step that throws a string", async () => {
    const engine = createNullEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    let calls = 0;
    let resolved = false;
    const done = runFrameInterpolation(scene, () => ++calls < 2).then(() => (resolved = true));
    stepScene(engine, scene, 16);
    stepScene(engine, scene, 16);
    expect(calls).toBe(2);
    expect(resolved).toBe(false);
    await done;
    expect(resolved).toBe(true);
    stepScene(engine, scene, 16);
    expect(calls).toBe(2);
    const failed = runFrameInterpolation(scene, () => { throw "stop"; });
    stepScene(engine, scene, 16);
    const error = await failed.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("stop");
});
