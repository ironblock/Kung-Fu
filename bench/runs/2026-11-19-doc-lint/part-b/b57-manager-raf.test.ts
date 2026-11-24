// b-57. Line 426: "startAnimationManager(manager); // autonomous requestAnimationFrame loop"
// Node has no requestAnimationFrame; a fake one is installed for the test.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, startAnimationManager, stopAnimationManager } from "@babylonjs/lite";
import { fakeRaf } from "./_fx";

test("startAnimationManager drives the manager from requestAnimationFrame frames", () => {
    const raf = fakeRaf();
    try {
        const manager = createAnimationManager();
        const target = { v: -1 };
        const group = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
        startAnimationManager(manager);
        expect(raf.pending()).toBe(1);
        raf.frame(1000);
        raf.frame(1250);
        raf.frame(1500);
        expect(group.currentTime).toBe(0.5);
        expect(target.v).toBe(5);
        expect(raf.pending()).toBe(1);
        stopAnimationManager(manager);
        expect(raf.pending()).toBe(0);
    } finally {
        raf.restore();
    }
});
