import { afterEach, expect, it, vi } from "vitest";
import { createAnimationManager, createPropertyAnimationGroup, startAnimationManager, stopAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { rampClip, thrown } from "./_lib";

afterEach(() => vi.unstubAllGlobals());

it("onUpdate runs only in startAnimationManager's loop; it throws without requestAnimationFrame; its first step is 0", () => {
    const steps: number[] = [];
    const manager = createAnimationManager({ onUpdate: (d) => steps.push(d) });
    const target = { value: 0 };
    createPropertyAnimationGroup(manager, target, rampClip());
    updateAnimationManager(manager, 100);
    expect(steps).toEqual([]);
    expect(thrown(() => startAnimationManager(manager))).toMatch(/requires requestAnimationFrame/);
    expect(manager.running).toBe(false);

    const frames: ((now: number) => void)[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: (now: number) => void) => frames.push(cb));
    vi.stubGlobal("cancelAnimationFrame", () => {});
    startAnimationManager(manager);
    expect(manager.running).toBe(true);
    frames[0]!(1000);
    frames[1]!(1100);
    frames[2]!(1350);
    expect(steps).toEqual([0, 100, 250]);
    expect(target.value).toBeCloseTo(4.5);
    stopAnimationManager(manager);
    expect(manager.running).toBe(false);
});
