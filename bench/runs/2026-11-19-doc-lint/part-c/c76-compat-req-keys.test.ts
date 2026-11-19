// c-76. Lines 652-654: "The supported path requires: at least one key on every animation;"
// Compat package. Checked: an Animation with no keys is not delegated (no Lite group; the reason names the key rule);
// the same call with one key is delegated.
import { anim, makeScene } from "./_compat";

test("no keys: not delegated; one key: delegated", () => {
    const scene = makeScene();
    const none = scene.beginDirectAnimation({ v: 0 }, [anim("v", [])], 0, 10, true);
    expect(none._lite).toBeUndefined();
    expect(none._nativeFallbackReason).toMatch(/at least one key/);
    const one = scene.beginDirectAnimation({ v: 0 }, [anim("v", [{ frame: 0, value: 1 }, { frame: 10, value: 1 }])], 0, 10, true);
    expect(one._lite).toBeDefined();
});
