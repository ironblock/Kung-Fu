import { addAnimationTask, createAnimationManager, createAnimationTask, startAnimationManager, stopAnimationManager, updateAnimationManager } from "@babylonjs/lite";

test("updateAnimationManager does not call onUpdate", () => {
    const calls: number[] = [];
    const manager = createAnimationManager({ onUpdate: (dt) => calls.push(dt) });
    updateAnimationManager(manager, 16);
    expect(calls).toEqual([]);
});

test("startAnimationManager throws where requestAnimationFrame is missing, as in Node", () => {
    expect(typeof (globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame).toBe("undefined");
    const manager = createAnimationManager();
    expect(() => startAnimationManager(manager)).toThrow("AnimationManager autonomous mode requires requestAnimationFrame");
    expect(manager.running).toBe(false);
});

test("in the requestAnimationFrame loop the first step is 0 ms, then the time difference; onUpdate gets each step", () => {
    const queue: ((now: number) => void)[] = [];
    const g = globalThis as Record<string, unknown>;
    g.requestAnimationFrame = (cb: (now: number) => void): number => {
        queue.push(cb);
        return queue.length;
    };
    g.cancelAnimationFrame = (): void => {};
    try {
        const steps: number[] = [];
        const onUpdate: number[] = [];
        const manager = createAnimationManager({ onUpdate: (dt) => onUpdate.push(dt) });
        addAnimationTask(manager, createAnimationTask((_m, dt) => steps.push(dt)));
        startAnimationManager(manager);
        expect(manager.running).toBe(true);
        queue.shift()!(1000);
        queue.shift()!(1016);
        queue.shift()!(1050);
        expect(steps).toEqual([0, 16, 34]);
        expect(onUpdate).toEqual([0, 16, 34]);
        stopAnimationManager(manager);
        expect(manager.running).toBe(false);
        queue.shift()?.(2000);
        expect(steps).toEqual([0, 16, 34]);
    } finally {
        delete g.requestAnimationFrame;
        delete g.cancelAnimationFrame;
    }
});
