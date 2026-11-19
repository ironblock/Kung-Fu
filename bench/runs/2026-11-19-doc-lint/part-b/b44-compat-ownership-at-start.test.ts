// b-44. Lines 398-399: "Evaluator ownership is chosen when playback starts; adding callbacks to a previously native track requires starting playback again."
// Compat package. A track starts native; a per-key callback added afterwards is not used by the
// running Lite group; a new start of the same Animation picks the compat evaluator and uses it.
import { createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { Animatable, Animation } from "#compat/animations/animation.ts";

test("a per-key callback added after start takes effect only on a new start", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const anim = new Animation("a", "v", 10);
    anim.setKeys([
        { frame: 0, value: 0 },
        { frame: 10, value: 10 },
    ]);
    const first = Animatable._create(() => manager, target, [anim], 0, 10, true, 1);
    expect(first._lite).toBeDefined();
    anim.setKeys([
        { frame: 0, value: 0, easingFunction: { ease: (g: number) => g * g } },
        { frame: 10, value: 10 },
    ]);
    updateAnimationManager(manager, 500);
    expect(target.v).toBe(5);
    expect(first._lite).toBeDefined();

    const other = { v: -1 };
    const second = Animatable._create(() => manager, other, [anim], 0, 10, true, 1);
    expect(second._lite).toBeUndefined();
    second._tick(500);
    expect(other.v).toBe(2.5);
});
