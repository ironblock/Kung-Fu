# Which sun-shadow settings do anything?

Our terrain has shadow acne under the sun, which casts soft (PCF) shadows through the library's directional-light PCF shadow generator. Our artist wants sliders for the generator's options, and I don't want sliders that change nothing.

For each option given when the generator is made, does changing its value (all else equal) change anything the library computes or sends to the GPU for that shadow?

1. `normalBias` (0 to 0.5)
2. `bias` (default to 0.01)
3. `darkness` (default to 0.6)
4. `mapSize` (default to 2048)

Write the answer to `notes/sun-shadow-options.json` in the app, `true` where the option changes something, `false` where it does not:

```json
{ "normalBias": true or false, "bias": true or false, "darkness": true or false, "mapSize": true or false }
```
