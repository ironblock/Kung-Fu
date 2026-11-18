# The time step of a frame interpolation

Camera moves in our app run through `runFrameInterpolation`. When the game is paused we keep rendering the scene, and each of those frames reports a delta of 0 ms. Before I decide whether pausing must cancel these moves, I need to know what time step their step function is given.

Write the answer to `notes/frame-step.json`. Give each value as the step function's argument for that one frame, multiplied by 1000 and rounded to two decimals:

```
{ "zeroMsFrame": number, "negativeFrame": number, "oneMsFrame": number, "fortyMsFrame": number }
```

- `zeroMsFrame`: a frame whose delta is 0 ms;
- `negativeFrame`: a frame whose delta is -5 ms (a clock that stepped back);
- `oneMsFrame`: a frame whose delta is 1 ms;
- `fortyMsFrame`: a frame whose delta is 40 ms.
