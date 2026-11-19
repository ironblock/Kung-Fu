I'm working on a small viewer app in /Users/Shared/kf/boxes/62b490/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /Users/Shared/kf/boxes/62b490/app/animation-api.d.ts, and some notes on how that code behaves, in /Users/Shared/kf/boxes/62b490/app/animation-notes.md. Read them first.

Our importer turns a scene file into property animation clips. Some four-number values are rotations stored as quaternions [x, y, z, w], under various property names; others are plain vectors that must change component by component. I need to know when the library interpolates a four-number track as a rotation (spherically), to know when to set the track's `quaternion` option myself.

Take one track, keys [0, 0, 0, 1] at 0 s and [0, 1, 0, 0] at 1 s, on a property starting at {x: 0, y: 0, z: 0, w: 1}, read after 0.5 s of updates. Write `notes/four-number-tracks.json`:

```json
{
  "orientationIsRotation": boolean,
  "orientationHalfwayW": number,
  "rotationQuaternionIsRotation": boolean,
  "nestedRotationQuaternionIsRotation": boolean,
  "falseOptionMakesRotationQuaternionPlain": boolean
}
```

Paths: `orientation`, `rotationQuaternion`, `node.rotationQuaternion`, without the option; the last field is `rotationQuaternion` with `quaternion: false`. The number is the `w` written for `orientation`.

Please keep every change inside /Users/Shared/kf/boxes/62b490/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
