I'm working on a small viewer app in /home/dev/3f53df/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for its animation code, in /home/dev/3f53df/app/animation-api.d.ts, and some notes on how that code behaves, in /home/dev/3f53df/app/animation-notes.md. Read them first.

Our doors open with a property animation clip that turns `door.angle` from 0 to 90 at a steady rate over 1 s (keys in seconds, default frame rate). To close a door I would like to play the same clip backward as a one-shot, a group made with `loop: false` and `speedRatio: -1`, rather than author a second clip. Before choosing, I need to know how that behaves. The door starts open (angle 90); we update the manager ourselves, 50 ms at a time. Write `notes/backward-door.json`:

```json
{
  "freshAngleAfterHalfSecond": number,
  "seekedAngleAfterHalfSecond": number,
  "seekedIsPlayingAfterThreeSeconds": boolean,
  "loopingAngleAfterQuarterSecond": number
}
```

"Fresh" is a group just made that way. "Seeked" is one made that way, then sent to its end with `goToFrame(group, 60)` and started with `playAnimation(group)` before the updates. "Looping" is a group made with `loop: true` and `speedRatio: -1`.

Please keep every change inside /home/dev/3f53df/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
