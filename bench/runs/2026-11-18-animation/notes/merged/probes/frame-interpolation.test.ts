import { runFrameInterpolation } from "@babylonjs/lite";
import { makeScene, tick } from "../../app/checks/helpers.ts";

test("step runs once per scene frame, from the next frame, with the delta in seconds; the promise resolves when step returns false", async () => {
    const scene = makeScene();
    const seen: number[] = [];
    let done = false;
    const p = runFrameInterpolation(scene, (dt) => (seen.push(dt), seen.length < 3)).then(() => (done = true));
    expect(seen).toEqual([]);
    tick(scene, 1, 20);
    tick(scene, 1, 0);
    tick(scene, 1, -5);
    tick(scene, 2, 16);
    await p;
    expect(done).toBe(true);
    expect(seen).toEqual([0.02, 1 / 60, 1 / 60]);
});

test("the driver is removed from the scene when it finishes", async () => {
    const scene = makeScene();
    const before = scene._beforeRender.length;
    const p = runFrameInterpolation(scene, () => false);
    expect(scene._beforeRender.length).toBe(before + 1);
    tick(scene);
    await p;
    expect(scene._beforeRender.length).toBe(before);
});

test("the promise rejects with what step throws, and step is not called again", async () => {
    const scene = makeScene();
    let calls = 0;
    const p = runFrameInterpolation(scene, () => {
        calls++;
        throw new Error("boom");
    });
    tick(scene, 3);
    await expect(p).rejects.toThrow("boom");
    expect(calls).toBe(1);
});

test("abort rejects with signal.reason; an already aborted signal rejects and step never runs", async () => {
    const scene = makeScene();
    const c = new AbortController();
    let calls = 0;
    const p = runFrameInterpolation(scene, () => (calls++, true), c.signal);
    tick(scene);
    c.abort(new Error("stop"));
    tick(scene);
    await expect(p).rejects.toThrow("stop");
    expect(calls).toBe(1);

    const c2 = new AbortController();
    c2.abort(new Error("early"));
    let calls2 = 0;
    const p2 = runFrameInterpolation(scene, () => (calls2++, true), c2.signal);
    tick(scene);
    await expect(p2).rejects.toThrow("early");
    expect(calls2).toBe(0);
});

test("a non-Error reason or thrown value is wrapped in an Error", async () => {
    const scene = makeScene();
    const p = runFrameInterpolation(scene, () => {
        throw "text";
    });
    tick(scene);
    await expect(p).rejects.toBeInstanceOf(Error);
    await expect(p).rejects.toThrow("text");
});
