// b-53. Lines 415-416: "Non-looping property groups apply the exact final pose once, then stop so a completed group cannot overwrite a later animation on subsequent manager ticks"
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a non-looping group writes the exact last key once, stops, and writes nothing after", () => {
    const manager = createAnimationManager();
    let writes: number[] = [];
    let value = -1;
    const target = {
        get v() {
            return value;
        },
        set v(next: number) {
            writes.push(next);
            value = next;
        },
    };
    const group = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10.3 }] }]), { loop: false });
    updateAnimationManager(manager, 700);
    writes = [];
    updateAnimationManager(manager, 700);
    expect(writes).toEqual([Math.fround(10.3)]);
    expect(group.isPlaying).toBe(false);
    writes = [];
    // a later animation writes the property
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("later", [{ path: "v", keys: [{ time: 0, value: 50 }, { time: 1, value: 50 }] }]));
    updateAnimationManager(manager, 100);
    updateAnimationManager(manager, 100);
    expect(writes).toEqual([50, 50]);
    expect(target.v).toBe(50);
});
