I'm working on a small viewer app in /home/dev/d57d0d/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for the parts I use (meshes, lights, shadows and the scene), in /home/dev/d57d0d/app/scene-api.d.ts, and some notes on how those parts behave, in /home/dev/d57d0d/app/scene-notes.md. Read them first.

# Shadows from the sun

Our courtyard scene has a sun, a directional light that other code has already made and placed but not yet put in the scene. Please write `src/sun-shadows.ts` exporting:

```ts
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

export function addSunShadows(engine: EngineContext, scene: SceneContext, sun: DirectionalLight): ShadowGenerator;
```

It puts the sun in the scene (once) and gives it a percentage-closer-filtered (PCF) shadow map, 2048 texels square, made for that sun. It returns that shadow generator; other code of ours tells it which meshes cast and marks the receivers, so leave that out.

Once the scene is running, its shadow pass must render this shadow map every time it renders shadows.

Please keep every change inside /home/dev/d57d0d/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
