I'm working on a small viewer app in /home/dev/508cac/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for the parts I use (meshes, lights, shadows and the scene), in /home/dev/508cac/app/scene-api.d.ts, and some notes on how those parts behave, in /home/dev/508cac/app/scene-notes.md. Read them first.

# Morning mist

Our harbour scene should sit in a light morning mist. Please write `src/mist.ts` exporting:

```ts
import type { SceneContext } from "@babylonjs/lite";

export function addMist(scene: SceneContext): void;
```

It gives the scene linear distance fog: nothing is fogged nearer than 30 units from the camera, and from 120 units on everything is fully the fog colour, a pale grey-blue (red 0.75, green 0.8, blue 0.88).

The mist has to show in the rendered frame: when the scene draws its next frame, the shaders must receive exactly these values. Our materials are the library's standard ones.

Please keep every change inside /home/dev/508cac/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
