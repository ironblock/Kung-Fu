import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";

/**
 * Measures how far one wheel notch moves the radius with the library's default
 * wheel handling, for the camera as it is right now. A throwaway probe camera with
 * the same settings is given the library's default controls on a detached canvas,
 * and one wheel event is dispatched to it. The probe is disposed afterwards.
 */
function measureDefaultNotchStep(camera: ArcRotateCamera): number {
	const probe = createArcRotateCamera(
		camera.alpha,
		camera.beta,
		camera.radius,
		{ x: camera.target.x, y: camera.target.y, z: camera.target.z },
	);
	probe.wheelPrecision = camera.wheelPrecision;
	probe.inertia = camera.inertia;
	probe.lowerRadiusLimit = camera.lowerRadiusLimit;
	probe.upperRadiusLimit = camera.upperRadiusLimit;

	const probeCanvas = document.createElement("canvas");
	const detach = attachControl(probe, probeCanvas);
	probeCanvas.dispatchEvent(new WheelEvent("wheel", { deltaY: 100, cancelable: true }));
	const offset = probe.inertialRadiusOffset;
	detach();

	return Math.abs(offset);
}

/**
 * Attaches the library's orbit controls (drag to orbit, right-drag to pan, pinch to zoom)
 * and replaces wheel zoom with a fixed radius step per wheel event. The step is measured
 * once, when this function is called, from the library's default wheel behaviour.
 *
 * Returns a function that removes all listeners this attaches.
 */
export function attachSteadyZoom(
	camera: ArcRotateCamera,
	canvas: HTMLCanvasElement,
	scene: SceneContext,
): () => void {
	const step = measureDefaultNotchStep(camera);
	if (!Number.isFinite(step) || step === 0) {
		throw new Error("steady-zoom: could not measure the library's default wheel step");
	}

	// The library's own controls are attached for drag, pan and pinch. Their wheel
	// handler is suppressed below, so it never changes the radius.
	const detachControls = attachControl(camera, canvas, scene);

	// Capture phase on window runs before the canvas, so stopImmediatePropagation
	// keeps the library's canvas wheel listener from seeing wheel events for this canvas.
	const onWheel = (event: WheelEvent) => {
		if (event.target !== canvas) return;
		event.stopImmediatePropagation();
		event.preventDefault();

		if (event.deltaY === 0) return;
		// Assumed: deltaY > 0 (wheel down) zooms out, i.e. the radius increases.
		const direction = event.deltaY > 0 ? 1 : -1;

		let radius = camera.radius + direction * step;
		if (camera.lowerRadiusLimit !== undefined) radius = Math.max(radius, camera.lowerRadiusLimit);
		if (camera.upperRadiusLimit !== undefined) radius = Math.min(radius, camera.upperRadiusLimit);
		camera.radius = radius;
		camera._clampToLimits?.();
	};
	window.addEventListener("wheel", onWheel, { capture: true, passive: false });

	return () => {
		window.removeEventListener("wheel", onWheel, { capture: true });
		detachControls();
	};
}
