// a-40, line 137: "/** Called after each autonomous tick, e.g. to render a custom view. */"
// In the manager's own rAF loop, onUpdate runs once per tick, after that tick's tasks.
import { addAnimationTask, createAnimationManager, createAnimationTask, startAnimationManager, stopAnimationManager } from "@babylonjs/lite";
import { withRaf } from "./_raf.ts";

test("onUpdate runs after each autonomous tick", () => {
    withRaf((frame) => {
        const order: string[] = [];
        const manager = createAnimationManager({ onUpdate: () => order.push("onUpdate") });
        addAnimationTask(manager, createAnimationTask(() => order.push("task")));
        startAnimationManager(manager);
        frame(1000);
        frame(1016);
        stopAnimationManager(manager);
        expect(order).toEqual(["task", "onUpdate", "task", "onUpdate"]);
    });
});
