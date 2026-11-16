# tighter-zoom.json: caveats

The values in tighter-zoom.json are estimates, not verified against Babylon Lite 1.39.0 (the library is not on this machine).

- asIs = 4000: nothing in the declarations or notes says that setting `camera.limits.radiusMax` clamps `radius` by itself. Likely no change.
- radiusSelf = 2000: assumes the `radius` write goes through a setter that clamps to `limits.radiusMax` even when the value is unchanged. The declarations show `radius` as a plain property, so this is an assumption. If `radius` is a plain field, the result is 4000.
- centerSelf = 4000: no evidence that the `center` setter touches `radius`. Unknown.
- emptyOrientation = 2000: assumes `setGeospatialOrientation` re-applies the current radius through the same clamp. Not confirmed; `camera-notes.md` only says to use it to set pitch and radius together.

To confirm, read the library source for the `radius` and `center` setters on the geospatial camera and for `setGeospatialOrientation`, or run the four cases on a real camera.
