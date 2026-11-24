I'm working on a small viewer app in /Users/Shared/kf/boxes/14e08e/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /Users/Shared/kf/boxes/14e08e/app/camera-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/14e08e/app/camera-notes.md. Read them first.

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

Please keep every change inside /Users/Shared/kf/boxes/14e08e/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
