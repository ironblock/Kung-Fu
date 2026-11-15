I'm working on a small viewer app in /home/dev/d24656/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its camera code, in /home/dev/d24656/app/camera-api.d.ts, and some notes on how that code behaves, in /home/dev/d24656/app/camera-notes.md. Read them first.

# Holding two arrow keys

Our viewer uses the library's own arrow-key control for the orbit (arc-rotate) camera, `keyboard: true` with default settings, scene running. QA says it behaves differently with two arrow keys held. Before deciding whether to tune it, I need to know, keys held for 60 frames, nothing else touching the camera:

1. Holding Right and Up together: how far does `alpha` turn, as a fraction of how far it turns with Right alone?
2. Holding Alt with Right and Up together: the same fraction, against Alt with Right alone.
3. Holding Ctrl with Right and Up together: does the orbit target move the same distance as with Ctrl and Right alone?

Please write the answer to `notes/arrow-keys.json` in the app, in this shape, fractions to two decimals:

```json
{ "rotateFraction": 0.0, "altFraction": 0.0, "ctrlSameDistance": true or false }
```

Please keep every change inside /home/dev/d24656/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
