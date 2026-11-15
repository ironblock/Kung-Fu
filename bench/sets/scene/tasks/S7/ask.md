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
