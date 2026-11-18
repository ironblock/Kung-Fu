# Notes on how the animation code of Babylon Lite 1.39.0 behaves

1. createPropertyAnimationGroup returns a group that is already playing and held by the manager, but its time advances only in updateAnimationManager. Scene frames (stepScene) never move it.
2. The deltaMs of updateAnimationManager is in milliseconds. currentTime, duration, key time, fromTime and toTime are in seconds, and a frame number is seconds times frameRate.
3. createPropertyAnimationGroup loops unless given loop: false. speedRatio and weight start at 1.
4. Nothing is written when a property group is created. Its first update writes the value at fromTime + step; updateAnimationManager(manager, 0) writes the value at fromTime.
5. With loop: false, a property group clamps at toTime, writes that value, then sets isPlaying to false. Later updates write nothing to the target.
6. goToFrame seeks to frame / group.frameRate seconds and pauses the group (isPlaying false). A property group writes that value at once; playAnimation goes on from there.
7. stopAnimation sets currentTime to fromTime (0 with no range) and writes nothing, so the target keeps its last value. After it, isPlaying = true does not resume the group; playAnimation does.
8. playAnimation on a property group that finished with loop: false leaves currentTime at toTime, so it stops again on the next update. Call stopAnimation, or set currentTime, before playAnimation to replay.
9. A looping property group keeps currentTime in [fromTime, toTime): an update that lands exactly on toTime writes the fromTime value, not the last key's.
10. A paused property group writes nothing on updates, even after currentTime is set. goToFrame, or an update after playAnimation, writes the value.
11. currentTime, speedRatio and loopAnimation can be set on a playing group. The next update starts from them, adding its step to the new currentTime.
12. runFrameInterpolation calls step on each later scene frame, not at once, with the delta in seconds (1/60 when it is 0 or less). Returning false or undefined ends it and resolves the promise.
13. Each key needs exactly one of time (seconds) or frame, or createPropertyAnimationClip throws. Keys are sorted by time, and clip.duration is the latest key time over all tracks.
14. A frame key uses its track's frameRate, else the clip's: options.frameRate, else the first track's frameRate, else 60. fromFrame, toFrame and goToFrame use the clip's.
15. evaluateSampler and evaluatePropertySampler are not exported from "@babylonjs/lite", nor are tickAnimation, tickAnimationCore, getAnimationGroupOwner and ANIMATION_GROUP_TASK_CATEGORY.
16. Keys of 2 to 4 numbers call set(...) on the property's object if it has set, else write its x, y, z, w. An {r, g, b} object makes createPropertyAnimationGroup throw; animate "color.r" alone instead.
17. group.weight changes nothing unless the manager has enablePropertyAnimationBlending (property groups) or enableAnimationBlending (glTF groups). Without it, every group writes its full value.
18. Under enablePropertyAnimationBlending, a property with any group of weight other than 1 gets the sum of value x weight over its groups, not divided by the total and with no original value. One group at 0.5 writes half.
19. crossFadeAnimationGroups fades from the groups' current weights, and a new group's weight is 1, so set toGroup's weight to 0 first. It neither plays nor stops either group.
20. fadeAnimationWeight sets weight to from (default: the current weight) at once, then moves it linearly by each update's step, before the groups run. A new fade on the same group replaces the old one.
21. When fixedDeltaMs > 0, every update uses it in place of deltaMs. Otherwise a negative, NaN or infinite deltaMs makes updateAnimationManager do nothing.
22. A track slerps only if its path is or ends in "rotationQuaternion", or it has quaternion: true. Other 4-number tracks are lerped per component and not normalized.
23. createPropertyAnimationGroup throws if a part of the dotted path is missing. Each write looks the owner up again, so a replaced target.position is followed; a vanished one makes the update throw.
24. fromTime/toTime win over fromFrame/toFrame, and currentTime starts at fromTime. toTime must exceed fromTime or creation throws, so a clip whose keys all sit at time 0 needs a toTime.
25. Before a track's first key it writes the first key's value, and after its last key the last key's value.
26. With interpolation "step", a track writes each key's value from that key's time until the next key's time. Its easing is not used.
27. Each update runs groups and tasks in the order they were first attached. Without blending, groups that write one property overwrite each other, and the last attached wins.
28. If step throws, the runFrameInterpolation promise rejects with an Error (a thrown non-Error is wrapped). If the signal aborts, it rejects with signal.reason and step is not called again.
29. createAnimationGroups makes one group per clip and only the first plays; the others do not move until playAnimation. An unnamed clip's group is named animation_<index>.
30. Scene frames advance a glTF group only if it came in through addToScene with an asset container; pushing it into scene.animationGroups does nothing. Once a manager holds it, the scene skips it.
31. A paused glTF group still writes its pose at currentTime on every update. A glTF group with loopAnimation false stays at its end with isPlaying still true.
32. goToFrame on a stopped glTF group, such as any clip but the first before playAnimation, writes nothing unless an engine is passed as its third argument.
33. goToFrame past the end wraps on a looping glTF group and clamps on a non-looping one. On a property group it clamps to [0, clip duration], ignoring fromTime and toTime.
34. A glTF group writes a node target only through position.set, rotationQuaternion.set and scaling.set, for the paths its clip animates. Nodes in excludedNodeIndices are never written.
35. Under enablePropertyAnimationBlending, a property whose groups all have weight 0 is not written, though their time runs. A paused group with weight other than 1 keeps writing each update.
36. A manager has one blending mode: the last call of enablePropertyAnimationBlending or enableAnimationBlending wins. Under enableAnimationBlending, property group weights are ignored.
37. Under enableAnimationBlending, a glTF group whose weight is not 1 makes the update throw unless the manager has an engine, and even then it does not write node targets.
38. group.mask matches glTF node names exactly, case included. A masked-out node gets its rest values written for the paths the clip animates. Without blending, a mask does not change what property groups write.
39. createAnimationGroupMask() with no arguments is Include mode with no names, so it masks out every node.
40. An in-place edit of mask.names at the same length (names[0] = "b") is not seen; assign a new array. disabled = true lets every node animate.
41. The easing functions other than bezierCurveEase are ease-in curves; (g) => 1 - f(1 - g) eases out. A track's easing reshapes each key-to-key segment, not the whole clip.
42. Eased values are not clamped, so with backEase or elasticEase a track writes values outside its keys' range. bezierCurveEase(1) with default control points returns NaN.
43. A negative speedRatio plays a property group backwards. With loop: false it clamps at fromTime and never ends: isPlaying stays true.
44. onUpdate runs only in startAnimationManager's requestAnimationFrame loop, whose first step is 0. startAnimationManager throws where requestAnimationFrame is missing, as in Node.
45. setAnimationWeight throws outside [0, 1], but a direct group.weight write is not checked: under property blending, weight 2 doubles that group's share.
46. removeAnimationGroup stops a group's updates. Adding a group held by another manager throws until it is removed, and a re-added group takes back its first-attach place.
47. In a property group, each targetedAnimations entry is { target, path }: the object that owns the last path part, and that part. For "position" on a node, target is the node.
48. The INTERP_* and PATH_* constants are not exported from "@babylonjs/lite"; write their numbers in hand-built clips.
49. setAnimationAdditive on a group held by a manager calls enableAnimationBlending on that manager, which ends its property blending.
50. Under enablePropertyAnimationBlending, a rotationQuaternion sum is normalized, so a weight above 0 on a lone quaternion track has no effect: it writes its full value.
