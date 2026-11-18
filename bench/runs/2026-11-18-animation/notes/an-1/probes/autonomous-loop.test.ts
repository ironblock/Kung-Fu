// Note: startAnimationManager throws without requestAnimationFrame; its first frame's delta is 0; onUpdate is called only by that loop.
import { afterEach, expect, it, vi } from "vitest";
import { addAnimationTask, createAnimationManager, createAnimationTask, startAnimationManager, stopAnimationManager, updateAnimationManager } from "@babylonjs/lite";

afterEach(() => vi.unstubAllGlobals());

it("throws in Node", () => {
    const manager = createAnimationManager();
    expect(typeof requestAnimationFrame).toBe("undefined");
    expect(() => startAnimationManager(manager)).toThrow(/requestAnimationFrame/);
    expect(manager.running).toBe(false);
});

it("onUpdate only from the loop; first delta 0", () => {
    const frames: ((t: number) => void)[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: (t: number) => void) => frames.push(cb));
    vi.stubGlobal("cancelAnimationFrame", () => {});
    const seen: number[] = [];
    const steps: number[] = [];
    const manager = createAnimationManager({ onUpdate: (d) => seen.push(d) });
    addAnimationTask(manager, createAnimationTask((_m, d) => steps.push(d)));
    updateAnimationManager(manager, 16);
    expect(seen).toEqual([]);
    startAnimationManager(manager);
    frames.shift()!(1000);
    frames.shift()!(1016);
    expect(steps).toEqual([16, 0, 16]);
    expect(seen).toEqual([0, 16]);
    stopAnimationManager(manager);
    expect(manager.running).toBe(false);
});
