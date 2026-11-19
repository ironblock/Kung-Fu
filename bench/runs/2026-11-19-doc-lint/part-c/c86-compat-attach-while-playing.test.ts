// c-86. Lines 673-675: "The compat facade owns native manager membership: delegated groups are attached only while
// actively playing, detached on pause, stop, or natural completion, and reattached on restart."
// Compat package. Checked by listing the groups on the scene's Lite manager after each call.
import { attached, frame, makeScene, ramp } from "./_compat";

test("membership follows playing", () => {
    const scene = makeScene();
    const a = scene.beginDirectAnimation({ v: 0 }, [ramp()], 0, 10, true);
    expect(attached(scene)).toEqual([a._lite]);
    a.pause();
    expect(attached(scene)).toEqual([]);
    a.restart();
    expect(attached(scene)).toEqual([a._lite]);
    a.stop();
    expect(attached(scene)).toEqual([]);
    a.restart();
    expect(attached(scene)).toEqual([a._lite]);
    a.stop();
    const once = scene.beginDirectAnimation({ v: 0 }, [ramp()], 0, 10, false);
    expect(attached(scene)).toEqual([once._lite]);
    frame(scene, 1500);
    expect(attached(scene)).toEqual([]);
});
