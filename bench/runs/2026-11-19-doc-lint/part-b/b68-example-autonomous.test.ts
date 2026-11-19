// b-68. Lines 460-467: "Autonomous, no-scene animation:" and the code under it.
// Run as written, with `clip` the xSlide clip of the example before it, `draw` a recorder and a fake
// requestAnimationFrame. Checked: with no scene, the manager's own loop moves the target and calls
// onUpdate after each step, when the target already holds that step's value.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, startAnimationManager, stopAnimationManager } from "@babylonjs/lite";
import { fakeRaf } from "./_fx";

test("onUpdate draws the target's value after each autonomous step", () => {
    const raf = fakeRaf();
    try {
        const clip = createPropertyAnimationClip("xSlide", [{ path: "position.x", frameRate: 10, keys: [{ frame: 0, value: 2 }, { frame: 10, value: -2 }, { frame: 20, value: 2 }] }]);
        const drawn: number[] = [];
        const draw = (x: number) => drawn.push(x);
        const target = { position: { x: -2 } };
        const manager = createAnimationManager({ onUpdate: () => draw(target.position.x) });
        createPropertyAnimationGroup(manager, target, clip);
        startAnimationManager(manager);
        raf.frame(1000);
        raf.frame(1500);
        raf.frame(2000);
        expect(drawn).toEqual([2, 0, -2]);
        stopAnimationManager(manager);
    } finally {
        raf.restore();
    }
});
