# G2: where the camera's east is decided

**Behaviour.** In the default (left-handed) build the camera's east at its starting centre (planetRadius, 0, 0) is world -Y, so positive longitudes as the camera reckons them run toward -Y, the opposite of textbook ECEF.

**What the plain answer gets wrong, and why.** It uses the standard ECEF formula `(R cos lat cos lon, R cos lat sin lon, R sin lat)`. The camera starts at (R, 0, 0) and its world north is +Z, both of which match ECEF, so a reader who knows geodesy (or Babylon.js's Z-north convention) sees nothing to doubt, and the type declarations give no hint of handedness. Latitudes come out right; every non-zero longitude lands on the mirror-image meridian, west instead of east (lon 20 goes to y = +342 where the camera's east is -Y).

**What decides it**, in `babylon-lite/packages/babylon-lite/src/camera/geospatial-camera.ts`:

- lines 13-15: `WORLD_NORTH = +Z`, `WORLD_RIGHT = +X`;
- lines 97-115, `computeLocalBasis`: line 105 computes east as `cross(up, worldNorth)` in the default build and `cross(worldNorth, up)` in the right-handed build (`_rightHanded` from `#coordinate-system`, `null` by default in `src/engine/coordinate-system.ts`). At (R, 0, 0) that gives east = (0, -1, 0);
- lines 132-140 and 262-264: yaw π/2 looks along that east;
- line 211: the starting centre (planetRadius, 0, 0).

**The makers' unit test that pins it:** none for the default build. `tests/lite/unit/right-handed-seams.test.ts`, "geospatial local basis swaps the cross products like ComputeLocalBasisToRefs(useRightHandedSystem)", pins only the right-handed variant (east = cross(+Z, up)).

**comment: no.** The doc comment on `computeLocalBasis` says "`east` and `north` complete the tangent frame. Like Babylon.js's `ComputeLocalBasisToRefs`, a right-handed build swaps the cross products, which turns `east` around and keeps `north`." It does not say which way east points; the cross product is only in a comment inside the body.
