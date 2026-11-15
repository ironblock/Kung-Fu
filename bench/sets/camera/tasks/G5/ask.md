# When does a tighter zoom limit take effect?

Our globe viewer uses the library's geospatial camera. Entering city mode tightens the zoom range: the app does `camera.limits.radiusMax = 2000` on a camera made with `createGeospatialCamera({ planetRadius: 1000 })` and never moved, so its `radius` is 4000. I need to know whether the camera is pulled inside the new limit by itself, or which statement to add after that line to make it so, before I write the mode switch.

For each case below, starting each time from such a camera just after that line, what does `camera.radius` read afterwards?

- `asIs`: nothing more is done.
- `radiusSelf`: `camera.radius = camera.radius;`
- `centerSelf`: `camera.center = camera.center;`
- `emptyOrientation`: `setGeospatialOrientation(camera, {});`

Please write the answer to `notes/tighter-zoom.json` in the app, as numbers:

```json
{ "asIs": 0, "radiusSelf": 0, "centerSelf": 0, "emptyOrientation": 0 }
```
