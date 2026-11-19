// a-10, lines 19-23, under "Public API Surface": "export const PATH_TRANSLATION = 0;" "export const PATH_ROTATION = 1;" "export const PATH_SCALE = 2;" "export const PATH_WEIGHTS = 3;"
// The section is the public API surface, so this probe asks the package's public entry for the names.
import * as lite from "@babylonjs/lite";

test("the four target-path constants are public, with these values", () => {
    const l = lite as Record<string, unknown>;
    expect([l.PATH_TRANSLATION, l.PATH_ROTATION, l.PATH_SCALE, l.PATH_WEIGHTS]).toEqual([0, 1, 2, 3]);
});
