# Notes on how the animation code of Babylon Lite 1.39.0 behaves

1. An AnimationManager is not driven by any scene, even when created with the scene's engine: its groups and tasks wait for updateAnimationManager. onBeforeRender(scene, (d) => updateAnimationManager(manager, d)) runs it every frame.
2. createPropertyAnimationGroup attaches the group to the manager and starts it playing, with loopAnimation true unless loop: false is passed. It writes nothing to the target until the next updateAnimationManager.
3. updateAnimationManager takes milliseconds; group.currentTime is in seconds. Each update advances time first, then writes, so updateAnimationManager(manager, 0) writes a playing group's value at its current time.
4. A non-looping property group that reaches toTime writes the end value, sets isPlaying false and stops writing. playAnimation alone leaves it at the end; stopAnimation then playAnimation replays it from fromTime.
5. @babylonjs/lite does not export evaluateSampler, evaluatePropertySampler, tickAnimationCore, tickAnimation, getAnimationGroupOwner, ANIMATION_GROUP_TASK_CATEGORY, INTERP_*, PATH_* or any _ function. group._animationManager is the owner.
6. goToFrame pauses the group. On a property group it writes the value at once, with the time clamped to 0..clip duration rather than to the play range, and playAnimation then resumes from that time.
7. pauseAnimation keeps currentTime, and a paused property group stops writing; playAnimation resumes. stopAnimation sets currentTime to the start (fromTime for property groups) and writes nothing.
8. A key's time is seconds; its frame is divided by the track's frameRate, else the clip's, which is options.frameRate, else tracks[0].frameRate, else 60. A key with both or neither of time and frame throws.
9. A track's path is dotted from the target, as 'position.x'. A size-1 track assigns the number. A size 2 to 4 track calls set(...) on the value if it has set, else writes its x, y, z, w fields.
10. A looping group wraps by modulo, so an update landing exactly on the range end gives the start value. A negative speedRatio plays backward; a non-looping group then stops at fromTime with isPlaying still true.
11. A property group's weight has no effect unless enablePropertyAnimationBlending was called on the manager. Without it each group writes its full value, and on a shared property the later-attached group wins.
12. Under enablePropertyAnimationBlending, a property with any group of weight other than 1 gets the sum of value x weight over its groups, not divided by the total and with no original value. One group at 0.5 writes half.
13. fadeAnimationWeight only tweens group.weight, linearly, by each update's step and before the groups are evaluated; it turns on no blending. from is applied at once, and a new fade on the same group replaces the old one.
14. fromTime/toTime win over fromFrame/toFrame, and currentTime starts at fromTime. toTime must exceed fromTime or creation throws, so a clip whose keys all sit at time 0 needs a toTime.
15. crossFadeAnimationGroups fades fromGroup to 0 and toGroup to toWeight (default 1) from their current weights. A new group is at 1, so it stays at 1 unless set to 0 first. Neither group is played, paused or removed.
16. runFrameInterpolation calls step once per scene frame from the next frame on, with the delta in seconds; a delta of 0 or less becomes 1/60. The promise resolves when step returns false, and the driver is removed.
17. Writing group.currentTime, speedRatio or loopAnimation takes effect at the next update, which adds its delta to the new currentTime. Setting isPlaying = false pauses like pauseAnimation.
18. A track slerps only if its path is or ends in "rotationQuaternion", or it has quaternion: true. Other 4-number tracks are lerped per component and not normalized.
19. Every easing function but bezierCurveEase is an ease-in curve, and there is no easing mode; (g) => 1 - cubicEase(1 - g) gives ease-out. A track's easing reshapes each span between two keys, not the whole clip.
20. With fixedDeltaMs above 0, every updateAnimationManager uses it and ignores the deltaMs passed, even 0, negative or NaN. Without it, a negative or non-finite deltaMs makes the update do nothing.
21. Keys may come in any order; they are sorted by time, and a negative time throws. clip.duration is the latest key time over all tracks; a shorter track holds its last value.
22. If step throws, the promise rejects with that value, made an Error if it is not one; if the signal aborts, it rejects with signal.reason. Step then never runs again, and never runs if the signal was already aborted.
23. Tasks run in the order added, and each attached group is one of those tasks. A task added during an update first runs on the next update; one removed during an update before its turn does not run.
24. Easing output is not clamped, so backEase and elasticEase go past the keys' values. Easing is skipped on step tracks, before the first key and from the last key on.
25. enableAnimationBlending and enablePropertyAnimationBlending fill the same single slot on a manager, so the last call wins. setAnimationAdditive on a group already in a manager calls enableAnimationBlending, turning property blending off.
26. createAnimationGroups returns one group per clip, attached to no manager. Only the first group plays; the others start stopped. A clip with no name gives animation_<index>. frameRate defaults to 60.
27. A paused glTF group still writes its pose at currentTime on every update. A glTF group with loopAnimation false stays at its end with isPlaying still true.
28. Scene frames advance a glTF group only if it came in through addToScene with an asset container; pushing it into scene.animationGroups does nothing. Once a manager holds it, the scene skips it.
29. getAnimationGroups lists groups in the order first added to that manager, and they update in that order. A group removed and added again returns to its first place. clearAnimationManager detaches every group.
30. createPropertyAnimationGroup throws if a part of the dotted path is missing. Each write looks the owner up again, so a replaced target.position is followed; a vanished one makes the update throw.
31. startAnimationManager throws where requestAnimationFrame is missing, as in Node. Its loop steps 0 ms on the first frame, then the frame time difference, and calls onUpdate; updateAnimationManager never calls onUpdate.
32. With enablePropertyAnimationBlending, a paused group of weight below 1 still writes its weighted value each update, and a property whose groups all have weight 0 is not written. A stopped group takes no part.
33. A mask matches glTF node names exactly, case included, and Include is the default mode. A masked-out node that has a scene target is set to its rest pose on every tick.
34. A glTF group does not pick up a change to mask.names made in place at the same length, like names[0] = "arm". It does pick up a new names array, a push, or a change to mode or disabled.
35. Under enableAnimationBlending, a glTF group whose weight is not 1 makes the update throw unless the manager has an engine, and even then it does not write node targets.
36. setAnimationWeight throws unless the weight is finite and within [0, 1]. Assigning group.weight directly is not checked.
37. A property group's targetedAnimations has { target, path } per track: the object owning the last path part, and that part, so "position.x" gives position and "x". duration is the whole clip's, even with a narrower range.
38. AnimationGroup.currentTime and duration are seconds, not frames. Each update moves currentTime by deltaMs / 1000 * speedRatio, and goToFrame turns its frame into seconds by dividing by frameRate, which is 60 when none was given.
39. playAnimation on a finished property group leaves currentTime at the end, so the next update ends it again. stopAnimation then playAnimation replays from the start; a seek before playAnimation replays from the seek.
40. Key values and key times are stored in a Float32Array, so written values are float32-rounded: a key value of 0.1 is written as 0.10000000149011612, and an exact === 0.1 check fails.
41. createPropertyAnimationGroup throws unless toTime > fromTime, so a clip whose keys all sit at time 0 (duration 0) throws unless toTime is passed.
42. Before the first key a track gives the first key's value; after the last key, the last key's. With interpolation 'step' each key holds until the next key's time, and at exactly that time the next key applies.
43. A multi-value track on a property with no set() and no x field, like {r, g, b} or an array, throws at createPropertyAnimationGroup, as does a key of more than 4 values. A number key replaces the property itself.
44. With enablePropertyAnimationBlending, a weight-1 group on a property that a weighted group also animates adds its full value. A property whose groups all have weight 1 is not mixed: the group added last wins.
45. With interpolation "step", a track writes each key's value from that key's time until the next key's time. Its easing is not used.
46. @babylonjs/lite does not export the INTERP_* or PATH_* constants. Hand-built clips use the numbers: interpolation 0 linear, 1 step, 2 cubic spline; path 0 translation, 1 rotation, 2 scale.
47. addAnimationGroup throws for a group owned by another manager and does nothing for its own. getAnimationGroups returns the manager's live array, and clearAnimationManager detaches every group.
48. A glTF group with no skeleton or morph needs no engine. Each update writes animated nodes' nodeTargets via position.set, rotationQuaternion.set and scaling.set; nodes in excludedNodeIndices are not written.
49. goToFrame on a looping glTF group wraps the time: frame 90 of a 1 s clip at 60 fps gives 0.5 s. On a stopped glTF group it sets currentTime but applies the pose only when engine is passed.
50. task.active = false skips a task but keeps it in manager.animations. removeAnimationTask sets active false and calls dispose(manager) once; clearAnimationManager does so for every task, last added first.
51. A negative speedRatio plays backward. A looping group wraps; a non-looping one stops moving at fromTime but keeps isPlaying true.
52. setAnimationAdditive throws if given both referenceFrame and referenceTime. On a group attached to a manager it calls enableAnimationBlending there; an additive group then needs a manager with an engine.
53. Setting isPlaying = true does not restart a group stopped by stopAnimation or by reaching its end, nor start a glTF group other than the first. Only playAnimation clears the stop.
54. A paused property group writes nothing on updates, even after currentTime is set. goToFrame, or an update after playAnimation, writes the value.
55. group.currentTime sums deltaMs / 1000 per update, so ten 100 ms updates give 0.9999999999999999. A 1 s non-looping group then still has isPlaying true; it ends on the next update.
56. A key value is a number or an array of numbers. An object value such as { x, y, z } or a Vector3 throws nothing and writes nothing to the target.
57. Once step returns false it is never called again, and the promise resolves on a later microtask, not inside the frame. If step throws, the promise rejects with an Error; a thrown string becomes its message.
58. Default parameters: powerEase power 2, exponentialEase exponent 2, backEase amplitude 1, elasticEase 3 oscillations and springiness 3, bounceEase 3 bounces and bounciness 2, bezierCurveEase (0, 0, 1, 1).
59. goToFrame past the end wraps on a looping glTF group and clamps on a non-looping one. On a property group it clamps to [0, clip duration], ignoring fromTime and toTime.
60. createAnimationGroupMask() with no arguments is Include mode with no names, so it masks out every node.
61. A glTF group's targetedAnimations has one entry per channel, with nodeIndex, targetName from nodeNames, target from nodeTargets, and path "translation", "rotation", "scale", "weights" or "pointer".
62. Under enablePropertyAnimationBlending, a rotationQuaternion sum is normalized, so a weight above 0 on a lone quaternion track has no effect: it writes its full value.
63. The first key as listed sets a track's size: 1 for a number or one-element array, else the array length. A key of another size throws. A size above 4 throws when bound to a target.
64. All paths of a group start at its one target, so a holder such as { a, b } with paths 'a.position.x' and 'b.alpha' animates several objects in one group. One clip can drive many targets.
65. bezierCurveEase with its default points is linear inside (0, 1), but bezierCurveEase(1) returns NaN. A track's easing is never called with 1: at the last key the last value is copied.
66. addAnimationTask sets active to true. Adding a task twice to one manager does nothing; adding it to a second manager throws until it is removed from the first.
67. A manager has one category handler. It runs before the tasks on each update; when it returns true, tasks of its category are skipped for that update. Setting another handler replaces it.
