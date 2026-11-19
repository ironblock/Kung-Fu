import { expect, test } from "vitest";
import { addAnimationTask, clearAnimationManager, createAnimationManager, createAnimationTask, removeAnimationTask, updateAnimationManager } from "@babylonjs/lite";

test("tasks a, b, c; a.active = false; one update; b removed twice; the manager cleared", () => {
    const m = createAnimationManager();
    const log: string[] = [];
    const task = (n: string) => createAnimationTask(() => log.push(`run ${n}`), { dispose: (owner) => log.push(`dispose ${n} ${owner === m}`) });
    const [a, b, c] = [task("a"), task("b"), task("c")];
    [a, b, c].forEach((t) => addAnimationTask(m, t));
    a.active = false;
    updateAnimationManager(m, 1);
    expect(m.animations).toEqual([a, b, c]);
    removeAnimationTask(m, b);
    removeAnimationTask(m, b);
    expect(b.active).toBe(false);
    expect(c.active).toBe(true);
    clearAnimationManager(m);
    expect(c.active).toBe(false);
    expect(m.animations).toEqual([]);
    expect(log).toEqual(["run b", "run c", "dispose b true", "dispose c true", "dispose a true"]);
});
