I'm working on a small viewer app in /Users/Shared/kf/boxes/49d462/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/49d462/app/animation-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/49d462/app/animation-notes.md. Read them first.

# The scene and an animation manager

Our model was added to the scene with `addToScene`, so its glTF clips play as the scene renders frames. To blend clips, I am thinking of attaching some of them to an `AnimationManager` with `addAnimationGroup`. Before I decide, I need to know how they share the work.

Take a looping clip 4 s long, playing at speed 1 from `currentTime` 0, and scene frames of 250 ms.

Answer in `notes/scene-and-manager.json`:

```
{ "sceneAdvancesAttached": boolean, "timeWithManagerUpdated": number, "sceneAdvancesSibling": boolean, "sceneAdvancesAfterRemove": boolean }
```

- `sceneAdvancesAttached`: once the clip is attached, does one scene frame change its `currentTime`?
- `timeWithManagerUpdated`: if each frame also calls `updateAnimationManager(manager, 250)` once, from a callback given to `onBeforeRender`, the clip's `currentTime` after one frame.
- `sceneAdvancesSibling`: does one frame advance another playing clip of the same model that was not attached?
- `sceneAdvancesAfterRemove`: after `removeAnimationGroup`, does one frame advance the clip again?

Please keep every change inside /Users/Shared/kf/boxes/49d462/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
