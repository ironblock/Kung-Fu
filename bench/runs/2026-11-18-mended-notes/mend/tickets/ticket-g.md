# Ticket g

## The note at fault
No note covers this. Note 40 says a drag turns "dx/angularSensitivity" and note 66 says "there is no pointer lock". Neither says which event fields give dx and dy.

## What the library does
File: camera/free-camera-controls.ts, function attachFreeControl; pointer handlers lines 31-52, listeners registered from line 164.
- Listeners on the canvas: pointerdown, pointermove, pointerup, contextmenu (prevented), keydown, keyup.
- onPointerDown: acts only if e.button is 0, 1 or 2. Then setPointerCapture(e.pointerId), isDragging = true, lastPX = e.clientX, lastPY = e.clientY. Other buttons do nothing.
- onPointerMove: returns at once unless isDragging. It does not look at e.button, e.buttons, e.pointerType or e.pointerId. Otherwise dx = e.clientX - lastPX and dy = e.clientY - lastPY, then lastPX and lastPY are set to the new client values. crY += dx / camera.angularSensitivity and crX += dy / camera.angularSensitivity.
- onPointerUp: releasePointerCapture(e.pointerId) and isDragging = false, for any pointerup on the canvas, whatever the button. There is no pointercancel or pointerleave handler.
- movementX and movementY are never read. The turn is built only from clientX and clientY differences between consecutive move events while dragging. A move event with no client change, or a move with no drag started, adds nothing.
- The accumulators crX and crY are applied only in the per-frame update (function update, line 73 on), which runs only when a scene was passed (pushed to scene._beforeRender). There camera._yaw += crY (negated if right-handed), camera._pitch -= crX, pitch clamped to +-(PI/2 - 0.01); then both accumulators are multiplied by camera.inertia and zeroed below camera.speed * 0.001. The rotation is applied only on a frame where an accumulator is not zero.

## What a reader is left to guess
Which events start a drag (pointerdown with button 0, 1 or 2, with no check of pointer type), what keeps it going (any pointermove after that, with no check of buttons, pointer type or pointer id), what ends it (any pointerup on the canvas), and which event fields dx and dy are built from (clientX and clientY differences only). The doc comment at lines 5-16 speaks of pointer-lock; the code has no pointer-lock path.
