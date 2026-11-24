# Notes on how the camera code of Babylon Lite 1.39.0 behaves

1. attachControl without a scene moves nothing on drags or wheel: they only add to inertialAlphaOffset, inertialRadiusOffset and the like, applied by the hook it pushes on scene._beforeRender. A two-finger pinch still writes radius at once.
2. Hand-written limit fields clamp no alpha/beta/radius write until setCameraLimits has run; after it, a write that changes the value is clamped at once to the current fields. interpolateArcRotateCamera obeys the fields either way.
3. Projection is reverse-Z: getProjectionMatrix maps nearPlane to depth 1 and farPlane to depth 0, so the z of projectWorldToScreen is 1 at the near plane and 0 at the far plane.
4. createArcRotateCamera starts with fov 0.8, nearPlane 0.1 and farPlane 1000.
5. Assigning a new object to an ArcRotateCamera's target marks nothing dirty: it and later edits to it show only when the matrix is next rebuilt (at the first read, or after an alpha, beta or radius change). Edit target.x/y/z in place.
6. GeospatialCamera clamps pitch to getEffectivePitchMax of the asked radius, before radius is clamped: pitchMin (0.001) at the default 4*planetRadius. Set radius first or use setGeospatialOrientation; zooming out lowers pitch for good.
7. interpolateArcRotateCamera rejects its promise if alpha, beta, radius or target change by anything else between its frames, a second call on the camera included; a change before its first frame becomes the start. That frame zeroes inertia.
8. An interrupted flyGeospatialCameraToAsync resolves its promise, it does not reject: a second fly on the same camera ends the first where it is.
9. attachFreeControl rebuilds target as position plus a unit vector from the yaw and pitch taken at createFreeCamera; a target written later is replaced on the first key move.
10. attachControl's wheel does inertialRadiusOffset -= deltaY * radius / (wheelPrecision * 1000), so a wheel step zooms by a share of the current radius, and positive deltaY moves the camera out.
