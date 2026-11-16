I'm working on a small viewer app in /home/dev/4e9f88/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for the parts I use (meshes, lights, shadows and the scene), in /home/dev/4e9f88/app/scene-api.d.ts, and some recipes for building a scene with it, in /home/dev/4e9f88/app/scene-recipes.md. Read them first.

# When is the shadow map redrawn?

For a frame-cost overlay we need to know when the sun's shadow map is re-rendered. Scene: a directional sun with a default PCF shadow map, drawn by the scene's shadow pass; two casters, a box and a thin-instanced crate mesh. Nothing moves unless we say so.

1. How many times is the map rendered over the first three frames?
2. We then change the sun's direction. Rendered again on the next frame?
3. Later, we only raise the sun's intensity. Rendered again next frame?
4. Later, we write new numbers straight into the crates' thin-instance matrix `Float32Array` (no library call). Rendered again next frame?

Write the answer to `notes/shadow-redraws.json` in the app:

```json
{ "rendersInFirstThreeFrames": number, "afterDirectionChange": true or false, "afterIntensityChange": true or false, "afterInPlaceMatrixEdit": true or false }
```

Please keep every change inside /home/dev/4e9f88/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
