// c-93. Lines 688-693: "Fallback ownership retains both the root target/dotted path and the resolved leaf
// object/property pair. Root-relative ancestor/descendant paths such as `position` and `position.x` therefore stay on
// the same evaluator across separate animation calls, while resolved leaf identity also preserves write order when
// different target objects alias the same nested property or an older stopped fallback is later restarted."
// Compat package. Checked, each across two separate calls, the second track supported on its own:
// (1) "position" on the fallback, then "position.x" on the same target: the second goes to the fallback too;
// (2) two targets sharing one position object: fallback "position.x" on the first, then "position.x" on the second:
//     the second goes to the fallback;
// (3) as (1) but the first animatable is stopped before the second call: the second still goes to the fallback.
import { anim, AnimationTypes, makeScene, square, Vector3 } from "./_compat";

const eased = (path: string, vector = false) =>
    anim(path, vector ? [{ frame: 0, value: [0, 0, 0], easingFunction: square }, { frame: 10, value: [1, 1, 1] }] : [{ frame: 0, value: 0, easingFunction: square }, { frame: 10, value: 1 }], 10, vector ? AnimationTypes.ANIMATIONTYPE_VECTOR3 : 0);
const plainX = () => anim("position.x", [{ frame: 0, value: 0 }, { frame: 10, value: 5 }]);

test("ancestor path across calls", () => {
    const scene = makeScene();
    const target = { position: new Vector3(0, 0, 0) };
    scene.beginDirectAnimation(target, [eased("position", true)], 0, 10, true);
    expect(scene.beginDirectAnimation(target, [plainX()], 0, 10, true)._lite).toBeUndefined();
});

test("aliased leaf across calls", () => {
    const scene = makeScene();
    const shared = new Vector3(0, 0, 0);
    scene.beginDirectAnimation({ position: shared }, [eased("position.x")], 0, 10, true);
    expect(scene.beginDirectAnimation({ position: shared }, [plainX()], 0, 10, true)._lite).toBeUndefined();
});

test("a stopped fallback still holds its paths", () => {
    const scene = makeScene();
    const target = { position: new Vector3(0, 0, 0) };
    scene.beginDirectAnimation(target, [eased("position", true)], 0, 10, true).stop();
    expect(scene.beginDirectAnimation(target, [plainX()], 0, 10, true)._lite).toBeUndefined();
});
