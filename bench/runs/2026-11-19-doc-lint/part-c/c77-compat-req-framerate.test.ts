// c-77. Line 655: requirement "one shared positive frame rate;"
// Compat package. Checked: two Animations at 10 and 20 fps in one call are not delegated; one at 0 fps is not
// delegated; two at 10 fps are.
import { makeScene, ramp } from "./_compat";

test("one shared positive frame rate", () => {
    const scene = makeScene();
    expect(scene.beginDirectAnimation({ a: 0, b: 0 }, [ramp("a", 10, 10), ramp("b", 10, 20)], 0, 10, true)._lite).toBeUndefined();
    expect(scene.beginDirectAnimation({ a: 0 }, [ramp("a", 10, 0)], 0, 10, true)._lite).toBeUndefined();
    expect(scene.beginDirectAnimation({ a: 0, b: 0 }, [ramp("a"), ramp("b")], 0, 10, true)._lite).toBeDefined();
});
