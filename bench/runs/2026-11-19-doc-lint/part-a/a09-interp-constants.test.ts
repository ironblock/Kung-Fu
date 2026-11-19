// a-09, lines 14-17, under "Public API Surface": "export const INTERP_LINEAR = 0;" "export const INTERP_STEP = 1;" "export const INTERP_CUBICSPLINE = 2;"
// The section is the public API surface, so this probe asks the package's public entry for the names.
import * as lite from "@babylonjs/lite";

test("the three interpolation constants are public, with these values", () => {
    const l = lite as Record<string, unknown>;
    expect([l.INTERP_LINEAR, l.INTERP_STEP, l.INTERP_CUBICSPLINE]).toEqual([0, 1, 2]);
});
