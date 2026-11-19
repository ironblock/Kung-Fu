import { describe, it, expect } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";
import { spinAround } from "../src/turntable";

async function flush(): Promise<void> {
    for (let i = 0; i < 20; i++) {
        await Promise.resolve();
    }
}

describe("spinAround", () => {
    it.each([0.75, 1, 2])("glides %s turns the way alpha grows, smoothly, and ends exactly there", async (turns) => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0.3, 1.1, 8, { x: 1, y: 2, z: 3 });
        let done = false;
        let failed: unknown;
        spinAround(cam, scene, turns).then(
            () => (done = true),
            (e) => (failed = e ?? "rejected")
        );
        await flush();

        const alphas = [cam.alpha];
        for (let frame = 0; frame < 3000 && !done && failed === undefined; frame++) {
            tick(scene);
            alphas.push(cam.alpha);
            await flush();
        }
        expect(failed).toBeUndefined();
        expect(done).toBe(true);

        let biggest = 0;
        for (let i = 1; i < alphas.length; i++) {
            const step = alphas[i]! - alphas[i - 1]!;
            expect(step).toBeGreaterThanOrEqual(-1e-9);
            biggest = Math.max(biggest, step);
        }
        expect(biggest).toBeLessThan(0.5);
        expect(cam.alpha).toBeCloseTo(0.3 + 2 * Math.PI * turns, 9);
        expect(cam.beta).toBeCloseTo(1.1, 9);
        expect(cam.radius).toBeCloseTo(8, 9);
        expect([cam.target.x, cam.target.y, cam.target.z]).toEqual([1, 2, 3]);
    });

    // The library's camera-transition easing closes a fixed share of the rest of the way at each frame of a given
    // length. So within one transition each frame's alpha step is the same fraction, below 1, of the step before.
    // A tween of the answer's own, such as a smoothstep over a number of frames, has steps that grow and shrink.
    it.each([
        [0.75, 16],
        [1, 16],
        [2, 16],
        [1.5, 33],
    ])("glides %s turns with the library's own easing, at frames of %s ms", async (turns, deltaMs) => {
        await sharedStepRatio(turns, deltaMs);
    });

    // The library's easing keeps the same share of the rest of the way per unit of time, whatever the frame rate:
    // the share kept in one frame is that share raised to the frame's length. So the step ratio at frames of 33 ms
    // is the ratio at 16 ms raised to the power 33/16, whatever the ease factor. An ease of a fixed share per
    // frame, or one worked out for a fixed frame length, keeps the same ratio at both.
    it("eases the same over time at frames of 16 ms and of 33 ms", async () => {
        const r16 = await sharedStepRatio(1, 16);
        const r33 = await sharedStepRatio(1, 33);
        expect(Math.log(r33) / Math.log(r16)).toBeCloseTo(33 / 16, 1);
    });
});

/** Runs the turn at frames of deltaMs, checks it lands, and gives the step ratio most frames share. */
async function sharedStepRatio(turns: number, deltaMs: number): Promise<number> {
    const scene = makeScene();
    const cam = createArcRotateCamera(0.3, 1.1, 8, { x: 1, y: 2, z: 3 });
    const ownAlpha = Object.getOwnPropertyDescriptor(cam, "alpha")?.get;
    const alpha = (): number => (ownAlpha ? ownAlpha.call(cam) : cam.alpha) as number;
    let done = false;
    let failed: unknown;
    spinAround(cam, scene, turns).then(
        () => (done = true),
        (e) => (failed = e ?? "rejected")
    );
    await flush();

    const alphas = [alpha()];
    for (let frame = 0; frame < 6000 && !done && failed === undefined; frame++) {
        tick(scene, 1, deltaMs);
        alphas.push(alpha());
        await flush();
    }
    expect(failed).toBeUndefined();
    expect(done).toBe(true);
    expect(alpha()).toBeCloseTo(0.3 + 2 * Math.PI * turns, 9);

    const steps = alphas
        .slice(1)
        .map((a, i) => a - alphas[i]!)
        .filter((step) => Math.abs(step) > 1e-9);
    const ratios = steps.slice(1).map((step, i) => step / steps[i]!);
    expect(ratios.length).toBeGreaterThan(10);
    const counts = new Map<string, number>();
    for (const r of ratios) {
        counts.set(r.toFixed(4), (counts.get(r.toFixed(4)) ?? 0) + 1);
    }
    const [commonest] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]!;
    const shared = Number(commonest);
    expect(shared).toBeGreaterThan(0);
    expect(shared).toBeLessThan(1);
    const same = ratios.filter((r) => Math.abs(r - shared) < 1e-3).length;
    expect(same / ratios.length).toBeGreaterThan(0.8);
    return shared;
}
