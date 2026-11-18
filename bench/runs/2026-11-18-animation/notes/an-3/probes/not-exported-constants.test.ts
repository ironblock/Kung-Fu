import { expect, it } from "vitest";
import * as lite from "@babylonjs/lite";

it("the INTERP_* and PATH_* constants are not exported from the package root", () => {
    for (const name of ["INTERP_LINEAR", "INTERP_STEP", "INTERP_CUBICSPLINE", "PATH_TRANSLATION", "PATH_ROTATION", "PATH_SCALE", "PATH_WEIGHTS", "PATH_POINTER"]) {
        expect(name in lite, name).toBe(false);
    }
});
