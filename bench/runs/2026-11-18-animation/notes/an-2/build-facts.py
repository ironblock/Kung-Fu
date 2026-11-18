# Builds facts.json from the list below, in order, and checks each note: at most 240 bytes,
# a real file of src/animation, an existing probe, no duplicate, no "usually" or "should".
# Run: python3 notes/build-facts.py
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
D = HERE + "/"
notes = [
 ("property-animation.ts", "manager-no-write-until-update.test.ts",
  "createPropertyAnimationGroup attaches the new group to the manager and plays it, looping unless loop is false. It writes nothing to the target until the next updateAnimationManager."),
 ("animation-manager.ts", "manager-no-write-until-update.test.ts",
  "updateAnimationManager takes milliseconds; group.currentTime is in seconds. Each update advances time first, then writes, so updateAnimationManager(manager, 0) writes a playing group's value at its current time."),
 ("animation-manager.ts", "scene-not-driving-manager.test.ts",
  "Scene frames do not update an AnimationManager. Calling updateAnimationManager(manager, dt) inside onBeforeRender(scene, (dt) => ...) makes the manager follow the scene's frames."),
 ("evaluate.ts", "exports.test.ts",
  "@babylonjs/lite does not export evaluateSampler, evaluatePropertySampler, tickAnimation, tickAnimationCore, getAnimationGroupOwner, ANIMATION_GROUP_TASK_CATEGORY, or any name that starts with _."),
 ("types.ts", "exports.test.ts",
  "@babylonjs/lite does not export the INTERP_* or PATH_* constants. Hand-built clips use the numbers: interpolation 0 linear, 1 step, 2 cubic spline; path 0 translation, 1 rotation, 2 scale."),
 ("animation-group.ts", "group-gotoframe.test.ts",
  "goToFrame sets currentTime to frame / group.frameRate, writes the pose at once without an update, and pauses the group (isPlaying false). playAnimation then resumes from that time."),
 ("property-animation.ts", "group-nonloop-end.test.ts",
  "A non-looping property group that reaches toTime writes the end value, sets isPlaying false and stops writing. playAnimation alone leaves it at the end; stopAnimation then playAnimation replays it from fromTime."),
 ("animation-group.ts", "group-pause-stop.test.ts",
  "pauseAnimation keeps currentTime, and a paused property group stops writing; playAnimation resumes. stopAnimation sets currentTime to the start (fromTime for property groups) and writes nothing."),
 ("animation-group.ts", "group-isplaying-stopped.test.ts",
  "Setting isPlaying = true does not restart a group stopped by stopAnimation or by reaching its end, nor start a glTF group other than the first. Only playAnimation clears the stop."),
 ("property-animation.ts", "clip-keys-framerate.test.ts",
  "Each key needs exactly one of time (seconds) or frame. A track converts frames with its own frameRate, else the clip's frameRate: options.frameRate, else the first track's frameRate, else 60."),
 ("property-animation.ts", "group-range.test.ts",
  "fromFrame and toFrame are divided by the clip's frameRate; fromTime and toTime win over them. The group starts at currentTime = fromTime. It throws unless toTime > fromTime."),
 ("property-animation.ts", "clip-zero-duration.test.ts",
  "A clip whose keys are all at time 0 has duration 0, and createPropertyAnimationGroup throws on it unless options.toTime above 0 is given."),
 ("property-animation.ts", "group-time-sum.test.ts",
  "group.currentTime sums deltaMs / 1000 per update, so ten 100 ms updates give 0.9999999999999999. A 1 s non-looping group then still has isPlaying true; it ends on the next update."),
 ("property-animation.ts", "write-paths.test.ts",
  "A track's path is dotted from the target, as 'position.x'. A size-1 track assigns the number. A size 2 to 4 track calls set(...) on the value if it has set, else writes its x, y, z, w fields."),
 ("property-animation.ts", "write-paths.test.ts",
  "createPropertyAnimationGroup throws if a path does not resolve, or if a size 2 to 4 track meets a value with no set and no x field, such as an array or an {r, g, b} color."),
 ("property-animation.ts", "clip-object-value.test.ts",
  "A key value is a number or an array of numbers. An object value such as { x, y, z } or a Vector3 throws nothing and writes nothing to the target."),
 ("evaluate.ts", "interp-ends-step.test.ts",
  "Before the first key a track gives the first key's value; after the last key, the last key's. With interpolation 'step' each key holds until the next key's time, and at exactly that time the next key applies."),
 ("evaluate.ts", "interp-easing.test.ts",
  "A track's easing receives the 0..1 progress between the two keys around the time, not the progress through the clip. It is not called for 'step' tracks. Its result is not clamped, so backEase undershoots."),
 ("easing.ts", "easing-shapes.test.ts",
  "Every easing function is the ease-in curve, as quadraticEase(0.25) = 0.0625. Each gives f(0) = 0, and f(1) = 1 except bezierCurveEase with default points. The library has no EasingMode, ease-out or ease-in-out."),
 ("weighted-pointer-mixer.ts", "blend-off-by-default.test.ts",
  "group.weight does nothing for property groups until enablePropertyAnimationBlending(manager). Before that each group writes its full value, and the group added to the manager last writes last."),
 ("weighted-pointer-mixer.ts", "blend-sum.test.ts",
  "With enablePropertyAnimationBlending, a property that a group of weight below 1 animates gets the sum of each group's value times its weight, not divided by the total. One group at weight 0.5 writes half its value."),
 ("weighted-pointer-mixer.ts", "blend-sum.test.ts",
  "With enablePropertyAnimationBlending, a weight-1 group on a property that a weighted group also animates adds its full value. A property whose groups all have weight 1 is not mixed: the group added last wins."),
 ("animation-weight-fade.ts", "fade-weight.test.ts",
  "fadeAnimationWeight sets group.weight to from (default: the current weight) at once, then moves it linearly at the start of each update of that manager, ending exactly on to. A new fade replaces the old."),
 ("animation-weight-fade.ts", "fade-cross.test.ts",
  "crossFadeAnimationGroups fades fromGroup to 0 and toGroup to toWeight (default 1) from their current weights. A new group is at 1, so it stays at 1 unless set to 0 first. Neither group is played, paused or removed."),
 ("property-animation.ts", "write-float32.test.ts",
  "Keyframe values are stored as float32, so a key of 0.1 writes 0.10000000149011612. group.currentTime is a plain number and is not rounded."),
 ("animation-group.ts", "group-direct-fields.test.ts",
  "Writing group.currentTime, speedRatio or loopAnimation takes effect at the next update, which adds its delta to the new currentTime. Setting isPlaying = false pauses like pauseAnimation."),
 ("frame-interpolation.ts", "frame-interpolation.test.ts",
  "runFrameInterpolation calls step once per scene frame from the next frame on, with the delta in seconds; a delta of 0 or less becomes 1/60. The promise resolves when step returns false, and the driver is removed."),
 ("frame-interpolation.ts", "frame-interpolation.test.ts",
  "If step throws, the promise rejects with that value, made an Error if it is not one; if the signal aborts, it rejects with signal.reason. Step then never runs again, and never runs if the signal was already aborted."),
 ("property-animation.ts", "group-loop-wrap.test.ts",
  "A looping group wraps by modulo, so an update landing exactly on the range end gives the start value. A negative speedRatio plays backward; a non-looping group then stops at fromTime with isPlaying still true."),
 ("property-animation.ts", "interp-quaternion.test.ts",
  "A track whose path is rotationQuaternion or ends in .rotationQuaternion is slerped the short way as a quaternion, without quaternion: true. Other size-4 tracks interpolate each component."),
 ("easing.ts", "easing-shapes.test.ts",
  "Default parameters: powerEase power 2, exponentialEase exponent 2, backEase amplitude 1, elasticEase 3 oscillations and springiness 3, bounceEase 3 bounces and bounciness 2, bezierCurveEase (0, 0, 1, 1)."),
 ("animation-manager.ts", "manager-steps.test.ts",
  "When manager.fixedDeltaMs is above 0, every update uses it in place of the deltaMs passed. With no fixed step, a negative, NaN or infinite deltaMs makes the update do nothing."),
 ("animation-manager.ts", "manager-onupdate-raf.test.ts",
  "startAnimationManager throws where requestAnimationFrame is missing, as in Node. Its loop steps 0 ms on the first frame, then the frame time difference, and calls onUpdate; updateAnimationManager never calls onUpdate."),
 ("animation-manager.ts", "tasks-order-removal.test.ts",
  "updateAnimationManager calls each active task as update(manager, step, task), in the order added. A task removed during an update does not run in it; a task added during an update first runs on the next."),
 ("animation-manager.ts", "tasks-active-dispose.test.ts",
  "task.active = false skips a task but keeps it in manager.animations. removeAnimationTask sets active false and calls dispose(manager) once; clearAnimationManager does so for every task, last added first."),
 ("animation-group-task.ts", "groups-attach.test.ts",
  "A group belongs to one manager: addAnimationGroup to another throws until removeAnimationGroup. removeAnimationGroup stops the ticking but leaves isPlaying and currentTime as they were."),
 ("animation-group-task.ts", "groups-attach.test.ts",
  "getAnimationGroups lists groups in the order first added to that manager, and they update in that order. A group removed and added again returns to its first place. clearAnimationManager detaches every group."),
 ("weighted-pointer-mixer.ts", "blend-zero-paused.test.ts",
  "With enablePropertyAnimationBlending, a paused group of weight below 1 still writes its weighted value each update, and a property whose groups all have weight 0 is not written. A stopped group takes no part."),
 ("weighted-gltf-mixer.ts", "blend-gltf-ignores-property.test.ts",
  "enableAnimationBlending and enablePropertyAnimationBlending fill the same slot on the manager; the later call replaces the other. Under enableAnimationBlending, property group weights are ignored."),
 ("animation-weight.ts", "weight-validate.test.ts",
  "setAnimationWeight throws unless the weight is finite and within [0, 1]. Assigning group.weight directly is not checked."),
 ("animation-group.ts", "gltf-create.test.ts",
  "createAnimationGroups returns one group per clip, attached to no manager. Only the first group plays; the others start stopped. A clip with no name gives animation_<index>. frameRate defaults to 60."),
 ("animation-group.ts", "gltf-manager-drive.test.ts",
  "A glTF group with no skeleton or morph needs no engine. Each update writes animated nodes' nodeTargets via position.set, rotationQuaternion.set and scaling.set; nodes in excludedNodeIndices are not written."),
 ("animation-group.ts", "gltf-manager-drive.test.ts",
  "A non-looping glTF group clamps at its end and keeps isPlaying true. A paused glTF group still writes its pose on every update."),
 ("animation-group.ts", "gltf-scene.test.ts",
  "addToScene with a container holding animationGroups ticks those groups on each scene frame. A group attached to an AnimationManager is skipped by the scene and moved only by the manager."),
 ("weighted-gltf-mixer.ts", "gltf-blend.test.ts",
  "Under enableAnimationBlending a glTF group of weight below 1 needs a manager created with an engine, or updateAnimationManager throws. Such groups update skeleton bones only and do not write nodeTargets."),
 ("animation-group-mask.ts", "mask-retains.test.ts",
  "createAnimationGroupMask copies names and defaults to Include. Include retains listed names, Exclude retains the others, a disabled mask retains all. Names match exactly and case-sensitively."),
 ("animation-group-mask.ts", "mask-gltf.test.ts",
  "On a glTF group, masked-out nodes get their rest pose. Changing mode or disabled, or assigning a new names array, applies at the next update; editing names in place at the same length does not."),
 ("property-animation.ts", "write-reresolve.test.ts",
  "Each write resolves the path from the target again, so a replaced target.position object receives the writes. A path that stops resolving makes updateAnimationManager throw."),
 ("property-animation.ts", "write-targeted.test.ts",
  "group.targetedAnimations has one { target, path } per track: the object owning the last path part, and that part. group.duration is the clip's duration, not the play range."),
 ("property-animation.ts", "clip-keys-framerate.test.ts",
  "Keys may come in any order; they are sorted by time, and a negative time throws. clip.duration is the latest key time over all tracks; a shorter track holds its last value."),
 ("property-animation.ts", "clip-value-size.test.ts",
  "The first key as listed sets a track's size: 1 for a number or one-element array, else the array length. A key of another size throws. A size above 4 throws when bound to a target."),
 ("property-animation.ts", "write-holder.test.ts",
  "All paths of a group start at its one target, so a holder such as { a, b } with paths 'a.position.x' and 'b.alpha' animates several objects in one group. One clip can drive many targets."),
 ("easing.ts", "easing-bezier.test.ts",
  "bezierCurveEase with its default points is linear inside (0, 1), but bezierCurveEase(1) returns NaN. A track's easing is never called with 1: at the last key the last value is copied."),
 ("animation-manager.ts", "tasks-active-dispose.test.ts",
  "addAnimationTask sets active to true. Adding a task twice to one manager does nothing; adding it to a second manager throws until it is removed from the first."),
 ("animation-manager.ts", "tasks-category.test.ts",
  "A manager has one category handler. It runs before the tasks on each update; when it returns true, tasks of its category are skipped for that update. Setting another handler replaces it."),
 ("weighted-gltf-mixer.ts", "additive.test.ts",
  "setAnimationAdditive throws if given both referenceFrame and referenceTime. On a group attached to a manager it calls enableAnimationBlending there; an additive group then needs a manager with an engine."),
]
anim = set(os.listdir(os.path.join(HERE, "..", "babylon-lite/packages/babylon-lite/src/animation")))
out = []
bad = False
total = 0
seen = set()
for about, probe, text in notes:
    b = len(text.encode("utf-8"))
    total += b
    if b > 240:
        print("TOO LONG", b, text); bad = True
    if about not in anim:
        print("BAD ABOUT", about); bad = True
    if not os.path.isfile(D + "probes/" + probe):
        print("NO PROBE", probe); bad = True
    if text in seen:
        print("DUP", text); bad = True
    seen.add(text)
    for w in ("usually", "should"):
        if w in text.lower():
            print("WORD", w, text); bad = True
    out.append({"text": text, "about": about, "probe": probe})
print("notes", len(out), "bytes", total)
if bad:
    sys.exit(1)
with open(D + "facts.json", "w") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
    f.write("\n")
