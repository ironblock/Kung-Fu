I'm working on a small viewer app in /Users/Shared/kf/boxes/c88029/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/c88029/app/animation-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/c88029/app/animation-notes.md. Read them first.

# Seeking a clip that is not playing

I want to build a pose preview on `goToFrame`. Before I choose how to call it, I need to know what it does with glTF clips that are not playing.

Take a model whose clips come from `createAnimationGroups`. They animate node translation only (no skin, no morph targets) and run at 60 frames per second. Clip 0 is playing; clip 1 has never been played. "Posed" means: right after the call, before any frame renders, the node holds the clip's value at that frame.

Write the answer to `notes/seek-stopped.json`:

```
{ "neverPlayedPosed": boolean, "neverPlayedCurrentTime": number, "stoppedPosed": boolean, "withEnginePosed": boolean, "playThenSeekPosed": boolean }
```

- `neverPlayedPosed`: is the node posed after `goToFrame(clip1, 30)`?
- `neverPlayedCurrentTime`: clip 1's `currentTime` right after that call.
- `stoppedPosed`: after `stopAnimation(clip0)` and then `goToFrame(clip0, 30)`?
- `withEnginePosed`: after `goToFrame(clip1, 30, engine)`, passing our engine?
- `playThenSeekPosed`: after `playAnimation(clip1)` and then `goToFrame(clip1, 30)`?

Please keep every change inside /Users/Shared/kf/boxes/c88029/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
