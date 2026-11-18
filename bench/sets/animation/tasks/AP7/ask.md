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
