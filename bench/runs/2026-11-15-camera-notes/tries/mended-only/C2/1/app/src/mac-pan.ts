import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/*
 * Ctrl + primary-button drag pans the orbit camera.
 *
 * The library's own controls are attached unchanged, so orbit, right-drag pan,
 * wheel and pinch behave as the library's defaults. A Ctrl + primary press on a
 * mouse is hidden from the library and replayed to it as a right-button drag:
 * the same pointer moves, the same button state, so the library's pan (speed,
 * radius scaling, glide) applies unchanged. Nothing runs per frame here.
 */

type Drag = { pointerId: number };

function replay(src: PointerEvent, target: HTMLCanvasElement, type: string, button: number, buttons: number): void {
	target.dispatchEvent(
		new PointerEvent(type, {
			bubbles: true,
			cancelable: true,
			composed: true,
			pointerId: src.pointerId,
			pointerType: src.pointerType,
			isPrimary: src.isPrimary,
			width: src.width,
			height: src.height,
			pressure: src.pressure,
			tiltX: src.tiltX,
			tiltY: src.tiltY,
			screenX: src.screenX,
			screenY: src.screenY,
			clientX: src.clientX,
			clientY: src.clientY,
			movementX: src.movementX,
			movementY: src.movementY,
			shiftKey: src.shiftKey,
			altKey: src.altKey,
			metaKey: src.metaKey,
			ctrlKey: false,
			button,
			buttons,
		}),
	);
}

export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
	// Without the scene, the library's drags and wheel only queue offsets that nothing applies.
	const detachLibrary: () => void = camera.attachControl(canvas, { scene });

	let drag: Drag | null = null;

	const endDrag = (src: PointerEvent, type: string): void => {
		if (!drag) return;
		drag = null;
		replay(src, canvas, type, 2, 0);
	};

	// Listeners sit on window in the capture phase so they run before the library's
	// canvas listeners. Replayed events are untrusted and are ignored here.
	const onPointerDown = (e: PointerEvent): void => {
		if (!e.isTrusted || drag || e.target !== canvas) return;
		if (e.pointerType !== "mouse" || e.button !== 0 || !e.ctrlKey) return;
		drag = { pointerId: e.pointerId };
		e.stopImmediatePropagation();
		replay(e, canvas, "pointerdown", 2, 2);
	};

	const onPointerMove = (e: PointerEvent): void => {
		if (!drag || !e.isTrusted || e.pointerId !== drag.pointerId) return;
		e.stopImmediatePropagation();
		replay(e, canvas, "pointermove", -1, 2);
	};

	const onPointerUp = (e: PointerEvent): void => {
		if (!drag || !e.isTrusted || e.pointerId !== drag.pointerId) return;
		e.stopImmediatePropagation();
		endDrag(e, e.type === "pointercancel" ? "pointercancel" : "pointerup");
	};

	// Mac browsers may open the context menu for Ctrl+click; suppress it during our drag.
	const onContextMenu = (e: Event): void => {
		if (drag && e.target === canvas) e.preventDefault();
	};

	// If the window loses focus mid-drag, the release may never arrive; end the drag then.
	const onBlur = (): void => {
		if (!drag) return;
		const id = drag.pointerId;
		drag = null;
		canvas.dispatchEvent(
			new PointerEvent("pointerup", { bubbles: true, cancelable: true, pointerId: id, pointerType: "mouse", isPrimary: true, button: 2, buttons: 0 }),
		);
	};

	window.addEventListener("pointerdown", onPointerDown, true);
	window.addEventListener("pointermove", onPointerMove, true);
	window.addEventListener("pointerup", onPointerUp, true);
	window.addEventListener("pointercancel", onPointerUp, true);
	window.addEventListener("contextmenu", onContextMenu, true);
	window.addEventListener("blur", onBlur);

	return () => {
		window.removeEventListener("pointerdown", onPointerDown, true);
		window.removeEventListener("pointermove", onPointerMove, true);
		window.removeEventListener("pointerup", onPointerUp, true);
		window.removeEventListener("pointercancel", onPointerUp, true);
		window.removeEventListener("contextmenu", onContextMenu, true);
		window.removeEventListener("blur", onBlur);
		if (drag) {
			// Release the library's pan before its own listeners are removed.
			const id = drag.pointerId;
			drag = null;
			canvas.dispatchEvent(
				new PointerEvent("pointerup", { bubbles: true, cancelable: true, pointerId: id, pointerType: "mouse", isPrimary: true, button: 2, buttons: 0 }),
			);
		}
		detachLibrary();
	};
}
