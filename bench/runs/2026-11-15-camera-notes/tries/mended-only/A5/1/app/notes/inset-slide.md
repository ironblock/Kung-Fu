# inset-slide.json: how these values were obtained

These values were NOT produced by running Babylon Lite 1.39.0. The library is not
installed in this environment and could not be inspected or executed. They were
derived by hand from camera-notes.md, items 25 and related text:

- Pixel x = viewport.x * 1000 = 800. Requested width = 0.3 * 1000 = 300.
  The rectangle runs past the 1000 px edge, so it was clamped to the target:
  width = 1000 - 800 = 200. (Assumes the clamp is an intersection; not confirmed.)
- Viewport y counts from the bottom, pixel y from the top. Bottom edge = 0.1 * 500 = 50 px
  above the bottom; top edge = (0.1 + 0.3) * 500 = 200 px above the bottom.
  Pixel y = 500 - 200 = 300. Height = 0.3 * 500 = 150. No vertical clamping needed.
- aspect: notes say getEffectiveAspectRatio multiplies width/height by
  viewport.width/viewport.height, giving (1000 / 500) * (0.3 / 0.3) = 2.00.
  If the function uses the clamped rectangle instead, it would be 200 / 150 = 1.33.
  This was not confirmed.

Verify against the real library before relying on these numbers, especially the
clamping rule (intersection vs. shifting x) and whether aspect uses the clamped size.
