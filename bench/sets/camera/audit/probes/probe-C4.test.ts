import { expect, it } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";
import { spinAround } from "../src/turntable";

// The library's camera-transition easing damps the rest of the way by a constant factor each frame: within a
// leg, each frame's alpha step is the same fraction (below 1) of the one before. A tween of its own does not.
// The camera's real alpha is read through its own getter, kept before the call; the eye through its own worldMatrix getter.
async function flush(): Promise<void> { for (let i = 0; i < 20; i++) await Promise.resolve(); }

for (const turns of [0.75, 1, 2]) {
    it(`C4 ${turns} turns: the steps follow the library's damping`, async () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0.3, 1.1, 8, { x: 1, y: 2, z: 3 });
        const ownA = Object.getOwnPropertyDescriptor(cam, "alpha")!.get!;
        const ownWm = Object.getOwnPropertyDescriptor(cam, "worldMatrix")!.get!;
        let done = false;
        spinAround(cam, scene, turns).then(() => (done = true), () => (done = true));
        await flush();
        const alphas = [ownA.call(cam) as number];
        for (let f = 0; f < 3000 && !done; f++) { tick(scene); ownWm.call(cam); alphas.push(ownA.call(cam) as number); await flush(); }
        const steps = alphas.slice(1).map((a, i) => a - alphas[i]!).filter((s) => Math.abs(s) > 1e-9);
        const ratios = steps.slice(1).map((s, i) => s / steps[i]!);
        const counts = new Map<string, number>();
        for (const r of ratios) counts.set(r.toFixed(5), (counts.get(r.toFixed(5)) ?? 0) + 1);
        const [mode, hits] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]!;
        const share = hits / ratios.length;
        const growing = ratios.filter((r) => r > 1.0001).length;
        console.log(`PROBE turns ${turns} frames ${alphas.length - 1} commonest step ratio ${mode} share ${share.toFixed(2)} growing steps ${growing} first steps ${steps.slice(0, 4).map((s) => s.toFixed(4)).join(",")}`);
        expect(Number(mode)).toBeLessThan(1);
        expect(share).toBeGreaterThan(0.8);
    });
}
