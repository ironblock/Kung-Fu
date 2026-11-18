# Ticket a

## The note at fault
Note 9: "attachControl's keyboard: true is ignored unless enableArcRotateKeyboardControls() ran first. Keys are heard on the canvas (tabIndex made 0 if no tabindex attribute); held arrows add 1/angularSensitivity (default 100) per frame, normalised."
Note 39 also speaks of the Alt branch: "with Alt, a held ArrowUp adds 1/zoomingSensitivity (default 25) to inertialRadiusOffset each frame". It is true but does not say the Alt branch is not normalised.

## What the library does
File: camera/arc-rotate-keyboard-controls.ts, function applyInput, lines 106-139. It runs once per frame step for the held keys.
Inputs: left, right, up, down are true when a mapped key is held. horizontal = right - left.
1. Meta held at the last key event (lines 107-109): nothing happens. Also a direction key pressed while Meta is held is not added to the held set (line 83), so it does not count after Meta is released, until it is pressed again.
2. Ctrl held (lines 117-125): vertical = up - down. magnitude = hypot(horizontal, vertical). If magnitude is not zero, inertialPanningX += horizontal / magnitude / panningSensitivity and inertialPanningY += vertical / magnitude / panningSensitivity. Normalised. Ctrl is tested before Alt, so Ctrl with Alt takes this branch.
3. Alt held, no Ctrl (lines 127-131): inertialAlphaOffset += horizontal / angularSensitivity, and inertialRadiusOffset += (up - down) / zoomingSensitivity. No hypot and no division by a magnitude. Each axis adds its own full step whether or not the other axis is held.
4. No modifier (lines 133-138): vertical = down - up (the opposite sign to the Ctrl branch). magnitude = hypot(horizontal, vertical). If not zero, inertialAlphaOffset += horizontal / magnitude / angularSensitivity and inertialBetaOffset += vertical / magnitude / angularSensitivity. Normalised.
Opposite keys held together cancel in every branch. Modifier state (lines 58-60) is taken from the last keydown or keyup on the canvas (updateModifiers, lines 75-79, called at 82 and 92). A blur of the canvas clears the held keys and the modifiers (clearState, lines 99-104, listener at 143).

## How the note misleads
A reader takes "normalised" to apply to all held arrows, or to whatever the modifier is. What is true: only the plain rotate branch and the Ctrl pan branch divide by the magnitude of the held-direction vector, so when keys on both axes are held, each axis gets 1/hypot of a single key's step. The Alt branch does not normalise; each axis gets its own full step whatever else is held. Also the divisor differs by branch: panningSensitivity for Ctrl, angularSensitivity for plain rotation and for Alt's alpha, zoomingSensitivity for Alt's radius.
