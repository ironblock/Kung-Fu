# Ticket b

## The note at fault
Note 13: "resolveCameraViewport counts camera.viewport.y from the bottom but returns y from the top: {x:0,y:0,width:0.5,height:0.5} on 800x600 gives {x:0,y:300,width:400,height:300}. Edges are clamped to the canvas: {x:-0.5,width:1} gives width 400."

## What the library does
File: camera/viewport.ts, function resolveCameraViewport, lines 20-31 (clamp01 at 14-16).
It reads camera.viewport, or the full viewport {0,0,1,1} if the camera or its viewport is missing. Then:
- x0 = clamp01(v.x); y0 = clamp01(1 - v.y - v.height); x1 = clamp01(v.x + v.width); y1 = clamp01(1 - v.y). Each edge is clamped to [0,1] as a fraction, before any pixels.
- x = floor(x0 * targetWidth); y = floor(y0 * targetHeight).
- width = max(0, ceil(x1 * targetWidth) - x); height = max(0, ceil(y1 * targetHeight) - y).
So width and height come from clamped edges, never from the raw width and height fields, and an off-canvas viewport shrinks or becomes zero-sized. Floor on the start edge and ceil on the far edge mean a fractional rectangle grows to whole pixels.
Other viewport code in camera.ts does not do this clamping: getEffectiveAspectRatio (line 236) uses the raw width and height fields, and the internal render-pass helper _applyCameraViewport (line 242 on) computes its rectangle from the raw fields without clamp01.

## How the note misleads
The note names only resolveCameraViewport, but "Edges are clamped to the canvas" with no function scope reads as a property of camera viewports in general. What is true: the clamp is done by resolveCameraViewport alone. The other viewport functions of the camera module read the raw fields and clamp nothing.
