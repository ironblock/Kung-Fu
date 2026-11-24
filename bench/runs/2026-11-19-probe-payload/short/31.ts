import { expect, test } from "vitest";
import { addAnimationTask, createAnimationManager, createAnimationTask, startAnimationManager, updateAnimationManager } from "@babylonjs/lite";

test("startAnimationManager in Node, then with a hand-driven requestAnimationFrame; updateAnimationManager with onUpdate set", () => {
    const onUpdate: number[] = [];
    const steps: number[] = [];
    const manager = createAnimationManager({ onUpdate: (dt) => onUpdate.push(dt) });
    addAnimationTask(manager, createAnimationTask((_m, dt) => steps.push(dt)));
    expect(() => startAnimationManager(manager)).toThrow("AnimationManager autonomous mode requires requestAnimationFrame");
    updateAnimationManager(manager, 16);
    expect(steps).toEqual([16]);
    expect(onUpdate).toEqual([]);
    const frames: ((now: number) => void)[] = [];
    const g = globalThis as Record<string, unknown>;
    g.requestAnimationFrame = (cb: (now: number) => void) => frames.push(cb);
    g.cancelAnimationFrame = () => {};
    startAnimationManager(manager);
    frames.shift()!(1000);
    frames.shift()!(1016);
    frames.shift()!(1050);
    expect(steps).toEqual([16, 0, 16, 34]);
    expect(onUpdate).toEqual([0, 16, 34]);
    delete g.requestAnimationFrame;
    delete g.cancelAnimationFrame;
});
