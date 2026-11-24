# L4: where the PCF options take effect

**The behaviour.** The directional-light PCF shadow generator accepts `normalBias` in its config but never reads it, so it changes nothing; `bias`, `darkness` and `mapSize` each change what is sent to the GPU. Right answer: `{ "normalBias": false, "bias": true, "darkness": true, "mapSize": true }`.

**What the reader would answer, and why.** All `true`. In Babylon.js `ShadowGenerator.normalBias` is the standard cure for acne and works with PCF; here the option sits in `PcfDirectionalShadowGeneratorConfig` next to `bias` with the same type, so nothing hints that it is dead.

**The code that decides it** (`babylon-lite/packages/babylon-lite/src/shadow/`):
- `pcf-directional-shadow-generator.ts`, line 31 declares `normalBias?`; lines 50-55 read every other option and never `cfg.normalBias`. The same holds for `pcf-spotlight-shadow-generator.ts` (31, 71-76). No file under `src/shadow` or `src/material` reads `normalBias` (only the unrelated contact-shadow post-process has its own).
- Where the others go: `bias` into the shadow-params buffer (`shadow-base.ts` 153-160) and the caster pass's biased projection (`pcf-shadow-task-hooks.ts` 331-345); `darkness` into `_shadowsInfo[0]` (line 58) and the receiver buffer; `mapSize` into the depth texture size (72-76) and `_shadowsInfo`.

**The makers' unit test:** none.

**comment: no.** The `normalBias` field carries no comment.
