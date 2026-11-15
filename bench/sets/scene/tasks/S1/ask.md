# Morning mist

Our harbour scene should sit in a light morning mist. Please write `src/mist.ts` exporting:

```ts
import type { SceneContext } from "@babylonjs/lite";

export function addMist(scene: SceneContext): void;
```

It gives the scene linear distance fog: nothing is fogged nearer than 30 units from the camera, and from 120 units on everything is fully the fog colour, a pale grey-blue (red 0.75, green 0.8, blue 0.88).

The mist has to show in the rendered frame: when the scene draws its next frame, the shaders must receive exactly these values. Our materials are the library's standard ones.
