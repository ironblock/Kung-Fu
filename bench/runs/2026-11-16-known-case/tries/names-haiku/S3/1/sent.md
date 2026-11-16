I'm working on a small viewer app in /home/dev/d5165c/app. It uses Babylon Lite 1.39.0, imported as "@babylonjs/lite". The library is not on this machine, so there is nothing to look it up in or to run.

What I do have is the library's type declarations for the parts I use (meshes, lights, shadows and the scene), in /home/dev/d5165c/app/scene-api.d.ts. Read them first.

# A sun for the whole valley

Our valley terrain is a 2000-unit square centred on the origin in x and z; everything on it (ground, rocks, trees, towers) lies between height 0 and 400. Please write `src/terrain-sun.ts` exporting:

```ts
import type { DirectionalLight, EngineContext, SceneContext, ShadowGenerator } from "@babylonjs/lite";

export function createValleySun(engine: EngineContext, scene: SceneContext, direction: [number, number, number]): { sun: DirectionalLight; shadows: ShadowGenerator };
```

It makes the sun, a directional light shining along `direction` (any length; it always points downwards) with intensity 1.3, puts it in the scene, and gives it a PCF shadow map of 2048 texels. Other code tells the generator which meshes cast.

Anything anywhere in the valley, at any height in that range, must be able to cast a shadow into that map: nothing in the valley may fall outside what the shadow map covers, in any direction.

Please keep every change inside /home/dev/d5165c/app. When you are done, tell me in a sentence or two what you did, and say if there was anything you were not sure of.

Here are the files in the app that matter:

FILE: app/scene-api.d.ts
```
// mesh/aabb-corners.d.ts
import type { Mesh } from "./mesh.js";
export interface BoneCornerBox {
    boneIndex: number;
    corners: Float32Array;
}
export declare function setExtentCorners(corners: Float32Array, min: ArrayLike<number>, max: ArrayLike<number>): void;
export declare function extentCorners(min: ArrayLike<number>, max: ArrayLike<number>): Float32Array;
export declare function buildSkinnedBoneCorners(mesh: Mesh): BoneCornerBox[] | null;
export declare function growCornersByMatrix(corners: Float32Array, matrix: ArrayLike<number>, min: number[], max: number[], offset?: number): void;
// mesh/compute-max-extents.d.ts
import type { AnimationGroup } from "../animation/animation-group.js";
import type { EngineContext } from "../engine/engine.js";
import type { Mesh } from "./mesh.js";
export interface MeshExtent {
    minimum: [number, number, number];
    maximum: [number, number, number];
}
export declare function computeMaxExtents(meshes: readonly Mesh[], animationGroup?: AnimationGroup | null, engine?: EngineContext | null, animationStep?: number): MeshExtent[];
// mesh/compute-normals.d.ts
export declare function computeNormals(positions: number[], indices: number[]): number[];
// mesh/create-box.d.ts
export interface BoxData {
    positions: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    indices: Uint32Array;
    vertexCount: number;
    indexCount: number;
}
export interface BoxOptions {
    size?: number;
    width?: number;
    height?: number;
    depth?: number;
}
export declare function createBoxData(options?: number | BoxOptions): BoxData;
// mesh/create-capsule.d.ts
export interface CapsuleData {
    positions: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    indices: Uint32Array;
}
export interface CapsuleOptions {
    height?: number;
    radius?: number;
    radiusTop?: number;
    radiusBottom?: number;
    tessellation?: number;
    subdivisions?: number;
    capSubdivisions?: number;
    topCapSubdivisions?: number;
    bottomCapSubdivisions?: number;
}
export declare function createCapsuleData(options?: CapsuleOptions): CapsuleData;
// mesh/create-cylinder.d.ts
export interface CylinderData {
    positions: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    indices: Uint32Array;
}
export interface CylinderOptions {
    height?: number;
    diameter?: number;
    diameterTop?: number;
    diameterBottom?: number;
    tessellation?: number;
    subdivisions?: number;
}
export declare function createCylinderData(options?: CylinderOptions): CylinderData;
// mesh/create-dashed-lines.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { Color4, Vec3 } from "../math/types.js";
import type { LineMaterial } from "../material/line/line-material.js";
import type { Mesh } from "./mesh.js";
export interface DashedLinesOptions {
    readonly name?: string;
    readonly points: ReadonlyArray<Vec3>;
    readonly dashSize?: number;
    readonly gapSize?: number;
    readonly dashNb?: number;
    readonly color?: Color4;
    readonly useVertexAlpha?: boolean;
    readonly material?: LineMaterial;
}
export interface DashedLinesUpdateOptions {
    readonly points: ReadonlyArray<Vec3>;
}
export declare function createDashedLines(engine: EngineContext, options: DashedLinesOptions): Mesh;
export declare function updateDashedLines(engine: EngineContext, mesh: Mesh, options: DashedLinesUpdateOptions): void;
// mesh/create-disc.d.ts
export interface DiscData {
    positions: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    indices: Uint32Array;
}
export interface DiscOptions {
    radius?: number;
    tessellation?: number;
    arc?: number;
}
export declare function createDiscData(options?: DiscOptions): DiscData;
// mesh/create-extrude.d.ts
import type { Vec3 } from "../math/types.js";
import { type RibbonData } from "./create-ribbon.js";
export { CAP_NONE, CAP_START, CAP_END, CAP_ALL } from "./create-tube.js";
export interface ExtrudeShapeOptions {
    shape: Vec3[];
    path: Vec3[];
    scale?: number;
    rotation?: number;
    cap?: number;
}
export declare function createExtrudeShapeData(options: ExtrudeShapeOptions): RibbonData;
// mesh/create-ground.d.ts
export interface GroundData {
    positions: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    indices: Uint32Array;
}
export interface GroundOptions {
    width?: number;
    height?: number;
    subdivisions?: number;
    minHeight?: number;
    maxHeight?: number;
    uvScale?: [number, number];
}
export declare function createFlatGroundData(opts?: GroundOptions): GroundData;
export declare function createGroundFromHeightMap(heightmapUrl: string, opts?: GroundOptions): Promise<GroundData>;
// mesh/create-line-system.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { Color4, Vec3 } from "../math/types.js";
import type { LineMaterial } from "../material/line/line-material.js";
import type { Mesh } from "./mesh.js";
export interface LineSystemData {
    readonly positions: Float32Array;
    readonly normals: Float32Array;
    readonly indices: Uint32Array;
    readonly colors?: Float32Array;
    readonly linePointCounts: Uint32Array;
}
export interface LineSystemDataOptions {
    readonly lines: ReadonlyArray<ReadonlyArray<Vec3>>;
    readonly colors?: ReadonlyArray<ReadonlyArray<Color4>>;
}
export interface LineSystemOptions extends LineSystemDataOptions {
    readonly name?: string;
    readonly color?: Color4;
    readonly useVertexAlpha?: boolean;
    readonly useThinInstances?: boolean;
    readonly useThinInstanceColors?: boolean;
    readonly material?: LineMaterial;
}
export interface LinesOptions {
    readonly name?: string;
    readonly points: ReadonlyArray<Vec3>;
    readonly colors?: ReadonlyArray<Color4>;
    readonly color?: Color4;
    readonly useVertexAlpha?: boolean;
    readonly useThinInstances?: boolean;
    readonly useThinInstanceColors?: boolean;
    readonly material?: LineMaterial;
}
export interface LineSystemUpdateOptions extends LineSystemDataOptions {
}
export declare function createLineSystemData(options: LineSystemDataOptions): LineSystemData;
export declare function createLineSystem(engine: EngineContext, options: LineSystemOptions): Mesh;
export declare function createLines(engine: EngineContext, options: LinesOptions): Mesh;
export declare function updateLineSystem(engine: EngineContext, mesh: Mesh, options: LineSystemUpdateOptions): void;
// mesh/create-plane.d.ts
export interface PlaneData {
    positions: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    indices: Uint32Array;
}
export interface PlaneOptions {
    size?: number;
    width?: number;
    height?: number;
}
export declare function createPlaneData(options?: PlaneOptions): PlaneData;
// mesh/create-polyhedron.d.ts
export interface PolyhedronData {
    positions: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    indices: Uint32Array;
}
export interface PolyhedronOptions {
    type?: number;
    size?: number;
    sizeX?: number;
    sizeY?: number;
    sizeZ?: number;
    flat?: boolean;
}
export declare function createPolyhedronData(options?: PolyhedronOptions): PolyhedronData;
// mesh/create-ribbon.d.ts
import type { Vec3 } from "../math/types.js";
export interface RibbonData {
    positions: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    indices: Uint32Array;
}
export interface RibbonOptions {
    pathArray: Vec3[][];
    closeArray?: boolean;
    closePath?: boolean;
    offset?: number;
}
export declare function createRibbonData(options: RibbonOptions): RibbonData;
// mesh/create-sphere.d.ts
export interface SphereMeshData {
    positions: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    indices: Uint32Array;
    vertexCount: number;
    indexCount: number;
}
export interface SphereOptions {
    segments?: number;
    diameter?: number;
    diameterX?: number;
    diameterY?: number;
    diameterZ?: number;
}
export declare function createSphereData(options?: SphereOptions): SphereMeshData;
// mesh/create-torus-knot.d.ts
export interface TorusKnotData {
    positions: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    indices: Uint32Array;
}
export interface TorusKnotOptions {
    radius?: number;
    tube?: number;
    radialSegments?: number;
    tubularSegments?: number;
    p?: number;
    q?: number;
}
export declare function createTorusKnotData(opts?: TorusKnotOptions): TorusKnotData;
// mesh/create-torus.d.ts
export interface TorusData {
    positions: Float32Array;
    normals: Float32Array;
    uvs: Float32Array;
    indices: Uint32Array;
}
export interface TorusOptions {
    diameter?: number;
    thickness?: number;
    tessellation?: number;
}
export declare function createTorusData(opts?: TorusOptions): TorusData;
// mesh/create-tube.d.ts
import type { Vec3 } from "../math/types.js";
import { type RibbonData } from "./create-ribbon.js";
export declare const CAP_NONE = 0;
export declare const CAP_START = 1;
export declare const CAP_END = 2;
export declare const CAP_ALL = 3;
export interface TubeOptions {
    path: Vec3[];
    radius?: number;
    tessellation?: number;
    radiusFunction?: (i: number, distance: number) => number;
    cap?: number;
    arc?: number;
}
export declare function createTubeData(options: TubeOptions): RibbonData;
// mesh/csg.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { Mesh } from "./mesh.js";
import type { Material } from "../material/material.js";
declare const csgSolidBrand: unique symbol;
export interface CsgSolid {
    readonly [csgSolidBrand]: true;
    readonly _polygons: readonly CsgPolygon[];
}
interface CsgVertex {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly nx: number;
    readonly ny: number;
    readonly nz: number;
    readonly u: number;
    readonly v: number;
}
declare class CsgPlane {
    nx: number;
    ny: number;
    nz: number;
    w: number;
    constructor(nx: number, ny: number, nz: number, w: number);
    clone(): CsgPlane;
    flip(): void;
}
declare class CsgPolygon {
    vertices: CsgVertex[];
    readonly materialSlot: number;
    plane: CsgPlane;
    constructor(vertices: CsgVertex[], materialSlot?: number);
    clone(): CsgPolygon;
    flip(): void;
}
export declare function createCsgFromMesh(mesh: Mesh, materialSlot?: number): CsgSolid;
export declare function csgUnion(a: CsgSolid, b: CsgSolid): CsgSolid;
export declare function csgSubtract(a: CsgSolid, b: CsgSolid): CsgSolid;
export declare function csgIntersect(a: CsgSolid, b: CsgSolid): CsgSolid;
export declare function createMeshFromCsg(engine: EngineContext, solid: CsgSolid, name?: string): Mesh;
export declare function createMeshesFromCsg(engine: EngineContext, solid: CsgSolid, materials: readonly Material[], name?: string): Mesh[];
export {};
// mesh/csg2.d.ts
import type { Manifold } from "manifold-3d";
import type { EngineContext } from "../engine/engine.js";
import type { Material } from "../material/material.js";
import type { Mesh } from "./mesh.js";
declare const csg2SolidBrand: unique symbol;
export interface Csg2Solid {
    readonly [csg2SolidBrand]: true;
    _manifold: Manifold | null;
    readonly _numProp: number;
}
export declare function isCsg2Ready(): boolean;
export declare function initializeCsg2Async(): Promise<void>;
export declare function createCsg2FromMesh(mesh: Mesh, materialSlot?: number): Csg2Solid;
export declare function csg2Subtract(a: Csg2Solid, b: Csg2Solid): Csg2Solid;
export declare function csg2Intersect(a: Csg2Solid, b: Csg2Solid): Csg2Solid;
export declare function csg2Add(a: Csg2Solid, b: Csg2Solid): Csg2Solid;
export declare function disposeCsg2(solid: Csg2Solid): void;
export declare function createMeshFromCsg2(engine: EngineContext, solid: Csg2Solid, name?: string): Mesh;
export declare function createMeshesFromCsg2(engine: EngineContext, solid: Csg2Solid, materials: readonly Material[], name?: string): Mesh[];
export {};
// mesh/enable-mirrored-meshes.d.ts
import type { SceneContext } from "../scene/scene-core.js";
export declare function enableMirroredMeshes(scene: SceneContext): Promise<void>;
// mesh/enable-thin-instance-world-bounds.d.ts
import type { Mesh } from "./mesh.js";
export declare function enableThinInstanceWorldBounds(mesh: Mesh): void;
// mesh/get-mesh-geometry.d.ts
import type { Mesh } from "./mesh.js";
export declare function getMeshTriangles(mesh: Mesh): {
    positions: Float32Array;
    indices: Uint32Array;
} | null;
export declare function getMeshGeometry(mesh: Mesh): {
    positions: Float32Array;
    normals: Float32Array;
    indices: Uint32Array;
    uvs?: Float32Array;
    uvs2?: Float32Array;
    tangents?: Float32Array;
    colors?: Float32Array;
} | null;
// mesh/hierarchy-instance-pool.d.ts
import type { Mat4, Mat4Storage } from "../math/types.js";
import type { SceneNode } from "../scene/scene-node.js";
import type { Mesh } from "./mesh.js";
export interface HierarchyInstancePoolBinding {
    mesh: Mesh;
    matrices: Float32Array;
    _meshWorldInverse: Mat4Storage;
    _meshWorld: Mat4Storage;
}
export interface HierarchyInstancePool {
    readonly root: SceneNode;
    readonly capacity: number;
    readonly meshes: readonly Mesh[];
    count: number;
    readonly _bindings: readonly HierarchyInstancePoolBinding[];
    readonly _scratch: Float32Array;
}
export declare function createHierarchyInstancePool(root: SceneNode, capacity: number): HierarchyInstancePool;
export declare function addHierarchyInstance(pool: HierarchyInstancePool, matrix: Mat4): number;
export declare function setHierarchyInstanceMatrix(pool: HierarchyInstancePool, index: number, matrix: Mat4): void;
export declare function removeHierarchyInstance(pool: HierarchyInstancePool, index: number): void;
export declare function setHierarchyInstanceCount(pool: HierarchyInstancePool, count: number): void;
// mesh/mesh-blending-tag.d.ts
import type { Mesh } from "./mesh.js";
export declare enum MeshBlendingRadiusClass {
    Small = 0,
    Medium = 1,
    Large = 2,
    ExtraLarge = 3
}
export interface MeshBlendingTag {
    groupId: number;
    radiusClass: number;
}
export interface MeshBlendRadiusDefinition {
    worldRadius: number;
    minimumProjectedRadius: number;
}
export type MeshBlendRadiusDefinitions = readonly [MeshBlendRadiusDefinition, MeshBlendRadiusDefinition, MeshBlendRadiusDefinition, MeshBlendRadiusDefinition];
export declare function packMeshBlendingTag(groupId: number, radiusClass: number): number;
export declare function validatePackedMeshBlendingTag(tag: number): number;
export declare function unpackMeshBlendingTag(tag: number): MeshBlendingTag;
export declare function createDefaultMeshBlendRadiusDefinitions(): MeshBlendRadiusDefinitions;
export declare function resolveMeshBlendingTag(mesh: Mesh): number;
// mesh/mesh-dispose.d.ts
import type { Mesh, MeshGPU } from "./mesh.js";
type VertexBufferDisposer = (gpu: MeshGPU) => void;
export declare function _installMeshRetirementObserver(observer: (mesh: Mesh) => void): void;
export declare function _installBorrowAwareGeometryDisposer(dispose: (gpu: MeshGPU, disposeVertices: VertexBufferDisposer) => void): void;
export declare function disposeMeshGpu(mesh: Mesh): void;
export {};
// mesh/mesh-draw-range-state.d.ts
import type { MeshGPU } from "./mesh.js";
export declare function setMeshDrawRangeSource(gpu: MeshGPU, source: NonNullable<MeshGPU["_drawRangeSource"]>): void;
// mesh/mesh-factories.d.ts
import { type EngineContext } from "../engine/engine.js";
import type { Mesh } from "./mesh.js";
import type { SphereOptions } from "./create-sphere.js";
import type { BoxOptions } from "./create-box.js";
import type { TorusOptions } from "./create-torus.js";
import type { TorusKnotOptions } from "./create-torus-knot.js";
import type { GroundOptions } from "./create-ground.js";
import type { CylinderOptions } from "./create-cylinder.js";
import type { CapsuleOptions } from "./create-capsule.js";
import type { PlaneOptions } from "./create-plane.js";
import type { DiscOptions } from "./create-disc.js";
import type { PolyhedronOptions } from "./create-polyhedron.js";
import type { RibbonOptions } from "./create-ribbon.js";
import type { TubeOptions } from "./create-tube.js";
import type { ExtrudeShapeOptions } from "./create-extrude.js";
export interface MeshGeometryCapacityResult {
    readonly stable: boolean;
    readonly vertexCapacity: number;
    readonly indexCapacity: number;
}
export interface MeshGeometryRange {
    readonly offset: number;
    readonly count: number;
}
export interface MeshDrawRange {
    readonly vertices: MeshGeometryRange;
    readonly indices: MeshGeometryRange;
}
export declare function setMeshDrawRange(engine: EngineContext, mesh: Mesh, range: MeshDrawRange): void;
export interface MeshGeometryUpdateRanges {
    readonly vertices: readonly MeshGeometryRange[];
    readonly indices: readonly MeshGeometryRange[];
}
export declare function createMeshFromData(engine: EngineContext, name: string, positions: Float32Array, normals: Float32Array, indices: Uint32Array, uvs?: Float32Array, uvs2?: Float32Array, tangents?: Float32Array, colors?: Float32Array): Mesh;
export declare function invalidateRenderBundles(engine: EngineContext): void;
export declare function updateMeshPositions(engine: EngineContext, mesh: Mesh, positions: Float32Array, vertexOffset?: number, vertexCount?: number, sourceVertexOffset?: number): void;
export declare function updateMeshGeometry(engine: EngineContext, mesh: Mesh, positions: Float32Array, normals: Float32Array, indices: Uint32Array, uvs?: Float32Array, uvs2?: Float32Array, tangents?: Float32Array, colors?: Float32Array): void;
export declare function updateMeshGeometryCapacity(engine: EngineContext, mesh: Mesh, positions: Float32Array, normals: Float32Array, indices: Uint32Array, uvs?: Float32Array, uvs2?: Float32Array, tangents?: Float32Array, colors?: Float32Array, reserveFactor?: number): MeshGeometryCapacityResult;
export declare function updateMeshGeometryCapacity(engine: EngineContext, mesh: Mesh, positions: Float32Array, normals: Float32Array, indices: Uint32Array, uvs: Float32Array | undefined, uvs2: Float32Array | undefined, tangents: Float32Array | undefined, colors: Float32Array | undefined, reserveFactor: number | undefined, ranges?: MeshGeometryUpdateRanges): MeshGeometryCapacityResult;
export declare function resizeMeshGeometry(engine: EngineContext, mesh: Mesh, positions: Float32Array, normals: Float32Array, indices: Uint32Array, uvs?: Float32Array, uvs2?: Float32Array, tangents?: Float32Array, colors?: Float32Array): void;
export declare function resizeSharedMeshGeometry(engine: EngineContext, meshes: readonly Mesh[], positions: Float32Array, normals: Float32Array, indices: Uint32Array, uvs?: Float32Array, uvs2?: Float32Array, tangents?: Float32Array, colors?: Float32Array): void;
export declare function updateMeshNormals(engine: EngineContext, mesh: Mesh, normals: Float32Array, vertexOffset?: number, vertexCount?: number, sourceVertexOffset?: number): void;
export declare function updateMeshColors(engine: EngineContext, mesh: Mesh, colors: Float32Array, vertexOffset?: number, vertexCount?: number, sourceVertexOffset?: number): void;
export declare function updateMeshUvs(engine: EngineContext, mesh: Mesh, uvs: Float32Array, vertexOffset?: number, vertexCount?: number, sourceVertexOffset?: number): void;
export declare function updateMeshUv2(engine: EngineContext, mesh: Mesh, uvs2: Float32Array, vertexOffset?: number, vertexCount?: number, sourceVertexOffset?: number): void;
export declare function updateMeshTangents(engine: EngineContext, mesh: Mesh, tangents: Float32Array, vertexOffset?: number, vertexCount?: number, sourceVertexOffset?: number): void;
export declare function createSphere(engine: EngineContext, options?: SphereOptions): Mesh;
export declare function createBox(engine: EngineContext, options?: number | BoxOptions): Mesh;
export declare function createTorus(engine: EngineContext, options?: TorusOptions): Mesh;
export declare function createTorusKnot(engine: EngineContext, options?: TorusKnotOptions): Mesh;
export declare function createGroundFromHeightMap(engine: EngineContext, url: string, options: GroundOptions): Promise<Mesh>;
export declare function createGround(engine: EngineContext, options?: GroundOptions): Mesh;
export declare function createCylinder(engine: EngineContext, options?: CylinderOptions): Mesh;
export declare function createCapsule(engine: EngineContext, options?: CapsuleOptions): Mesh;
export declare function createPlane(engine: EngineContext, options?: PlaneOptions): Mesh;
export declare function createDisc(engine: EngineContext, options?: DiscOptions): Mesh;
export declare function createPolyhedron(engine: EngineContext, options?: PolyhedronOptions): Mesh;
export declare function createRibbon(engine: EngineContext, options: RibbonOptions): Mesh;
export declare function createTube(engine: EngineContext, options: TubeOptions): Mesh;
export declare function createExtrudeShape(engine: EngineContext, options: ExtrudeShapeOptions): Mesh;
// mesh/mesh-from-storage.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { Mesh } from "./mesh.js";
import { type StorageBuffer } from "../resource/storage-buffer.js";
export interface MeshFromStorageOptions {
    readonly storage: StorageBuffer;
    readonly indices: Uint16Array | Uint32Array | StorageBuffer;
    readonly indexFormat?: GPUIndexFormat;
    readonly indexCount?: number;
    readonly vertexCount: number;
    readonly arrayStride: number;
    readonly attributeOffsets?: Partial<Record<"position" | "normal" | "tangent" | "uv" | "uv2" | "color", number>>;
    readonly baseVertex?: number;
    readonly boundMin?: readonly [number, number, number];
    readonly boundMax?: readonly [number, number, number];
}
export declare function createMeshFromStorageBuffer(engine: EngineContext, name: string, options: MeshFromStorageOptions): Mesh;
// mesh/mesh-indexed-indirect-borrow.d.ts
import type { Mesh } from "./mesh.js";
import { type StorageBuffer } from "../resource/storage-buffer.js";
export interface MeshIndexedDrawInfo {
    readonly mode: "direct" | "indirect";
    readonly indexCapacity: number;
    readonly indexCount: number | null;
    readonly instanceCount: number | null;
}
export declare function setMeshIndexedIndirect(mesh: Mesh, buffer: StorageBuffer | null, byteOffset?: number): void;
export declare function getMeshIndexedDrawInfo(mesh: Mesh): MeshIndexedDrawInfo;
// mesh/mesh-indexed-indirect.d.ts
import type { MeshGPU } from "./mesh.js";
export declare function writeMeshIndexedIndirectArgs(args: Uint32Array, gpu: MeshGPU, instanceCount: number): void;
// mesh/mesh-vertex-buffer-layout.d.ts
import type { MeshVbLayout } from "./mesh.js";
export declare function applyMeshVertexBufferLayout(layouts: readonly GPUVertexBufferLayout[], attributeNames: readonly string[], layout?: MeshVbLayout): readonly GPUVertexBufferLayout[];
// mesh/mesh-vertex-layout.d.ts
import type { MeshVbLayout } from "./mesh.js";
export declare function createMeshVertexLayout<T extends MeshVbLayout>(attributes: T): T;
// mesh/mesh-world-bounds.d.ts
import type { Mesh } from "./mesh.js";
export interface WorldAabbAcc {
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
}
export declare function emptyWorldAabb(): WorldAabbAcc;
export declare function expandWorldAabbForMesh(acc: WorldAabbAcc, mesh: Mesh): void;
// mesh/mesh.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { Material } from "../material/material.js";
import type { SkeletonData, MorphTargetData, VatData } from "../animation/types.js";
import type { ThinInstanceData } from "./thin-instance.js";
import type { WorldAabbAcc } from "./mesh-world-bounds.js";
import type { SceneNode } from "../scene/scene-node.js";
export interface MeshVbAttr {
    readonly _stride: number;
    readonly _offset: number;
    readonly _count?: number;
}
export interface MeshVbLayout {
    readonly [attributeName: string]: MeshVbAttr | undefined;
}
export interface MeshGPU {
    readonly positionBuffer: GPUBuffer;
    readonly normalBuffer: GPUBuffer;
    readonly tangentBuffer?: GPUBuffer | null;
    readonly uvBuffer: GPUBuffer;
    readonly uv2Buffer?: GPUBuffer | null;
    readonly colorBuffer?: GPUBuffer | null;
    _shaderColorFallback?: GPUBuffer;
    readonly hasUv?: boolean;
    readonly hasUv2?: boolean;
    readonly hasTangent?: boolean;
    readonly hasColor?: boolean;
    readonly indexBuffer: GPUBuffer;
    readonly indexCount: number;
    readonly indexFormat: GPUIndexFormat;
    _firstIndex?: number;
    _drawRangeSource?: {
        indexCount: number;
        positions: Float32Array;
        normals: Float32Array;
        indices: Uint32Array;
        uvs?: Float32Array;
        uvs2?: Float32Array;
        tangents?: Float32Array;
        colors?: Float32Array;
    };
    _baseVertex?: number;
    readonly _vertexCount?: number;
    readonly _ownsVertexBuffers?: boolean;
    readonly _ownsIndexBuffer?: boolean;
    _vertexCapacity?: number;
    _indexCapacity?: number;
    _indexScratch?: Uint32Array;
    readonly _vbLayout?: MeshVbLayout;
    readonly _vbKey?: string;
    _refCount?: number;
    _recoverShared?: (engine: EngineContext, mesh: Mesh, upload: (engine: EngineContext, mesh: Mesh) => MeshGPU) => MeshGPU;
}
export interface Mesh extends SceneNode {
    id?: string;
    material: Material;
    receiveShadows: boolean;
    _skipColorDraw?: boolean;
    boundMin?: [number, number, number];
    boundMax?: [number, number, number];
    skeleton?: SkeletonData | null;
    vat?: VatData | null;
    morphTargets?: MorphTargetData | null;
    _runtimeThinBuild?: (scene: import("../scene/scene-core.js").SceneContext, mesh: Mesh, pending?: Promise<void>) => Promise<void>;
    renderOrder?: number;
    renderOnTop?: boolean;
    thinInstances?: ThinInstanceData | null;
    _expandWorldBounds?: (bounds: WorldAabbAcc, mesh: Mesh) => void;
    hasVertexAlpha?: boolean;
    pickable?: boolean;
    meshBlendingTag?: number;
    _gpu: MeshGPU;
    _disposed?: boolean;
    _authoredSign?: number;
    _clone?: string;
    _topology?: number;
    _linePointCounts?: Uint32Array;
    _dashedLineOptions?: readonly [dashSize: number, gapSize: number];
    _shadowMaxCascade?: number;
    _renderableGen?: number;
    _cpuPositions?: Float32Array;
    _cpuNormals?: Float32Array;
    _cpuUvs?: Float32Array;
    _cpuUv2s?: Float32Array | null;
    _cpuTangents?: Float32Array | null;
    _cpuColors?: Float32Array | null;
    _cpuIndices?: Uint32Array;
    _cpuGpuIndices?: Uint16Array | Uint32Array;
    _cpuIndexFormat?: GPUIndexFormat;
}
export declare function initMeshTransform(partialMesh: Partial<Mesh> & {
    _flatNormal?: boolean;
}, px?: number, py?: number, pz?: number, rx?: number, ry?: number, rz?: number, sx?: number, sy?: number, sz?: number): Mesh;
export declare function uploadMeshToGPU(engine: EngineContext, positions: Float32Array, normals: Float32Array, indices: Uint32Array, uvs?: Float32Array, uvs2?: Float32Array, tangents?: Float32Array, colors?: Float32Array): MeshGPU;
// mesh/path3d.d.ts
import type { Vec3 } from "../math/types.js";
export interface Path3D {
    tangents: Vec3[];
    normals: Vec3[];
    binormals: Vec3[];
    distances: number[];
}
export declare function computePath3D(curve: Vec3[], firstNormal?: Vec3 | null): Path3D;
// mesh/polyhedron-data.d.ts
export interface PolyhedronSpec {
    vertex: number[][];
    face: number[][];
}
export declare const POLYHEDRA: PolyhedronSpec[];
// mesh/thin-instance-cull-binding.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { RenderTargetSignature } from "../engine/render-target.js";
import type { SceneContext } from "../scene/scene.js";
import type { DrawUpdateContext, Renderable } from "../render/renderable.js";
import type { Mesh, MeshGPU } from "./mesh.js";
import type { ThinInstanceDrawBuffers } from "./thin-instance-gpu.js";
import { type ComputeDispatchBatch } from "./thin-instance-gpu-culling.js";
export interface TiCullBinding {
    update(context: DrawUpdateContext): void;
    cullDrawBufs: ThinInstanceDrawBuffers | null;
    _args: GPUBuffer | null;
    _updateBatch: ComputeDispatchBatch;
    draw(pass: GPURenderPassEncoder | GPURenderBundleEncoder, gpu: MeshGPU, instanceCount: number): void;
}
export declare function tryBind(renderable: Renderable, scene: SceneContext, mesh: Mesh, engine: EngineContext, hasColor: boolean, excluded: boolean, baseUpdate: ((context: DrawUpdateContext) => void) | undefined, signature: RenderTargetSignature): TiCullBinding | undefined;
// mesh/thin-instance-gpu-culling.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { RenderTargetSignature } from "../engine/render-target.js";
import type { DrawUpdateBatch, DrawUpdateContext } from "../render/renderable.js";
import type { Mesh, MeshGPU } from "./mesh.js";
import type { ThinInstanceData } from "./thin-instance.js";
import type { ThinInstanceDrawBuffers } from "./thin-instance-gpu.js";
export interface ThinInstanceGpuCullState {
    _capacity: number;
    _visibleMatrixBuffer: GPUBuffer | null;
    _visibleColorBuffer: GPUBuffer | null;
    _argsBuffer: GPUBuffer | null;
    _paramsBuffer: GPUBuffer | null;
    _bindGroup: GPUBindGroup | null;
    _srcMatrixBuffer: GPUBuffer | null;
    _srcColorBuffer: GPUBuffer | null;
    _hasColor: boolean;
    _localSphereReady: boolean;
    _localPositions?: Float32Array;
    _localBoundMin?: Mesh["boundMin"];
    _localBoundMax?: Mesh["boundMax"];
    _localSphere: Float32Array;
    _paramsBytes: ArrayBuffer;
    _paramsF32: Float32Array;
    _paramsU32: Uint32Array;
    _argsData: Uint32Array;
    _drawBuffers: ThinInstanceDrawBuffers | null;
    _indexCount: number;
    _baseVertex: number;
    _firstIndex?: number;
    _active: boolean;
    _lodActive: boolean;
    _lodMatrixBuffer: GPUBuffer | null;
    _lodColorBuffer: GPUBuffer | null;
    _lodArgsBuffer: GPUBuffer | null;
    _lodIndexCount: number;
    _lodBaseVertex: number;
    _lodFirstIndex?: number;
    _lodArgsZeroed: boolean;
}
export interface ThinInstanceGpuCullResult {
    readonly drawBuffers: ThinInstanceDrawBuffers;
    readonly argsBuffer: GPUBuffer;
    readonly lodDrawBuffers?: ThinInstanceDrawBuffers;
    readonly lodArgsBuffer?: GPUBuffer;
}
interface ComputeDispatch {
    readonly pipeline: GPUComputePipeline;
    readonly bindGroup: GPUBindGroup;
    readonly workgroupsX: number;
}
export interface ComputeDispatchBatch extends DrawUpdateBatch {
    queue(dispatch: ComputeDispatch): void;
}
export declare function getComputeDispatchBatch(signature: RenderTargetSignature): ComputeDispatchBatch;
export declare function createTiCullState(): ThinInstanceGpuCullState;
export declare function destroyTiCullState(state: ThinInstanceGpuCullState): void;
export declare function prepareTiCull(engine: EngineContext, state: ThinInstanceGpuCullState, mesh: Mesh, gpu: MeshGPU, ti: ThinInstanceData, hasColor: boolean, context: DrawUpdateContext, dispatchBatch?: ComputeDispatchBatch, lodMesh?: Mesh | null): ThinInstanceGpuCullResult | null;
export declare function publishTiLodBucket(ti: ThinInstanceData, signature: RenderTargetSignature, result: ThinInstanceGpuCullResult | null): void;
export {};
// mesh/thin-instance-gpu.d.ts
import type { ThinInstanceData } from "./thin-instance.js";
import type { EngineContext } from "../engine/engine.js";
import type { MeshGPU } from "./mesh.js";
export interface ThinInstanceDrawBuffers {
    readonly matrixBuffer: GPUBuffer;
    readonly colorBuffer: GPUBuffer | null;
}
export declare function syncThinInstanceGpuData(engine: EngineContext, ti: ThinInstanceData, hasColor: boolean): boolean;
export declare function syncThinInstanceDrawArgs(engine: EngineContext, ti: ThinInstanceData, gpu: MeshGPU): GPUBuffer;
export declare function syncThinInstanceForDraw(engine: EngineContext, ti: ThinInstanceData, hasColor: boolean, gpu: MeshGPU): GPUBuffer | null;
export declare function syncThinInstanceBuffers(engine: EngineContext, ti: ThinInstanceData, pass: GPURenderPassEncoder | GPURenderBundleEncoder, slot: number, hasColor: boolean, drawBuffers?: ThinInstanceDrawBuffers | null): number;
// mesh/thin-instance.d.ts
import type { Mat4 } from "../math/types.js";
import type { Mesh } from "./mesh.js";
import type { RenderTargetSignature } from "../engine/render-target.js";
export interface ThinInstanceLodBucket {
    matrixBuffer: GPUBuffer;
    colorBuffer: GPUBuffer | null;
    argsBuffer: GPUBuffer;
    active: boolean;
}
export interface ThinInstanceData {
    matrices: Float32Array | Float64Array;
    count: number;
    _capacity: number;
    _version: number;
    _gpuBuffer: GPUBuffer | null;
    _gpuVersion: number;
    _dirtyMin: number;
    _dirtyMax: number;
    colors?: Float32Array | null;
    _colorVersion: number;
    _colorDirtyMin: number;
    _colorDirtyMax: number;
    _colorGpuBuffer: GPUBuffer | null;
    _colorGpuBufferStorage: boolean;
    _colorGpuVersion: number;
    _drawArgsBuffer?: GPUBuffer | null;
    _drawArgsData?: Uint32Array;
    _drawArgsInstanceCount?: number;
    _uploadF32?: Float32Array;
    _gpuCullingEnabled: boolean;
    _cullBoundsPad?: number;
    _lodPartner?: Mesh | null;
    _lodDistance?: number;
    _lodBand?: number;
    _lodSource?: Mesh | null;
    _lodBuckets?: WeakMap<RenderTargetSignature, ThinInstanceLodBucket> | null;
    _lodAutoCull?: boolean;
    _refCount?: number;
}
export declare function setThinInstances(mesh: Mesh, matrices: Float32Array | Float64Array, count: number): void;
export declare function setThinInstanceCount(mesh: Mesh, count: number): void;
export declare function setThinInstanceDrawCount(mesh: Mesh, count: number): void;
export declare function enableThinInstanceDynamicDrawCount(mesh: Mesh): void;
export declare function addThinInstance(mesh: Mesh, matrix: Mat4): number;
export declare function setThinInstanceMatrix(mesh: Mesh, index: number, matrix: Mat4): void;
export declare function removeThinInstance(mesh: Mesh, index: number): void;
export declare function flushThinInstances(mesh: Mesh): void;
export declare function setThinInstanceColors(mesh: Mesh, colors: Float32Array): void;
export declare function setThinInstanceColor(mesh: Mesh, index: number, r: number, g: number, b: number, a: number): void;
export declare function enableThinInstanceGpuCulling(mesh: Mesh, enabled?: boolean): void;
export declare function setThinInstanceCullBoundsPad(mesh: Mesh, pad: number): void;
export interface ThinInstanceLodPartnerOptions {
    distance: number;
    band?: number;
}
export declare function setThinInstanceLodPartner(fullMesh: Mesh, lodMesh: Mesh, options: ThinInstanceLodPartnerOptions): void;
export declare function clearThinInstanceLodPartner(fullMesh: Mesh): void;
export declare function _detachThinInstanceLodMesh(mesh: Mesh): void;
// mesh/vertex-defaults.d.ts
import type { EngineContext } from "../engine/engine.js";
export declare function _enableVertexDefaults(engine: EngineContext): void;
// light/area-light-blur.d.ts
export declare function areaLightGaussian(distance: number): Float32Array;
export declare function blurAreaLightPixels(input: Uint8Array, size?: number): Uint8Array<ArrayBuffer>;
// light/area-light-emission-setup.d.ts
import type { SceneContext } from "../scene/scene.js";
import type { SceneLightingExtension } from "./lighting-extension.js";
import { clearAreaLightEmission } from "./area-light-emission.js";
export { clearAreaLightEmission };
export declare function prepareRectAreaEmission(scene: SceneContext, lighting: SceneLightingExtension): Promise<void>;
// light/area-light-emission-wgsl.d.ts
import type { BindingDecl } from "../shader/fragment-types.js";
import type { WgslSource } from "../shader/wgsl.js";
export declare function areaLightEmissionBindings(): BindingDecl[];
export declare function areaLightEmissionWgsl(): WgslSource;
// light/area-light-emission.d.ts
import type { SceneContext } from "../scene/scene.js";
export declare function clearAreaLightEmission(scene: SceneContext): void;
export declare function prepareAreaLightEmission(scene: SceneContext): Promise<number | undefined>;
export declare function bindAreaLightEmission(id: number | undefined, device: GPUDevice, entries: GPUBindGroupEntry[], binding: number, disposers: (() => void)[] | undefined): number;
// light/area-light-image.d.ts
import type { Texture2D } from "../texture/texture-2d.js";
export interface AreaLightImage {
    readonly device: GPUDevice;
    readonly texture: GPUTexture;
}
export declare function validateAreaLightSource(source: Texture2D): void;
export declare function validateAreaLightImage(source: Texture2D, device: GPUDevice): void;
// light/area-light-ltc.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { SceneContext } from "../scene/scene.js";
type LtcPixels = [Uint16Array<ArrayBuffer>, Uint16Array<ArrayBuffer>];
export declare function hasAreaLightLtcOwner(scene: SceneContext): boolean;
export declare function decodeAreaLightLtc(payload: ArrayBuffer): LtcPixels;
export declare function prepareAreaLightLtc(scene: SceneContext): Promise<void>;
export declare function bindAreaLightLtc(engine: EngineContext, entries: GPUBindGroupEntry[], binding: number): number;
export {};
// light/area-light-wgsl.d.ts
import type { BindingDecl } from "../shader/fragment-types.js";
import type { WgslSource } from "../shader/wgsl.js";
export declare function areaLightBindings(): BindingDecl[];
export declare function areaLightWgsl(resultType?: string, form?: string, parameters?: string, arguments_?: string, extraHelpers?: string): WgslSource;
export declare const AREA_LIGHT_WGSL: WgslSource;
// light/clustered-spot-support.d.ts
import type { ClusteredLightContainer } from "./clustered.js";
export declare function _enableClusteredSpotSupport(container: ClusteredLightContainer): void;
// light/clustered.d.ts
import { type Camera } from "../camera/camera.js";
import type { EngineContext } from "../engine/engine.js";
import type { SceneContext } from "../scene/scene.js";
export interface ClusteredPointLight {
    position: [number, number, number];
    diffuse: [number, number, number];
    range: number;
    intensity: number;
}
export interface ClusteredSpotLight extends ClusteredPointLight {
    direction: [number, number, number];
    angle: number;
}
export interface ClusteredLightContainer {
    readonly kind: "clusteredLightContainer";
    pointLights: ClusteredPointLight[];
    spotLights: ClusteredSpotLight[];
    horizontalTiles: number;
    verticalTiles: number;
    zSlices: number;
    _version: number;
    _spotSupport?: _ClusteredSpotSupport;
}
export interface ClusteredPointLightOptions {
    position: [number, number, number];
    diffuse: [number, number, number];
    range?: number;
    intensity?: number;
}
export interface ClusteredSpotLightOptions extends ClusteredPointLightOptions {
    direction: [number, number, number];
    angle?: number;
}
export interface ClusteredLightContainerOptions {
    horizontalTiles?: number;
    verticalTiles?: number;
    zSlices?: number;
}
export interface ClusteredLightGpuState {
    paramsBuffer: GPUBuffer;
    lightsView: GPUTextureView;
    cellsView: GPUTextureView;
    indicesView: GPUTextureView;
    _hasSpots?: true;
    refresh(camera: Camera | null | undefined, targetWidth: number, targetHeight: number): void;
    dispose(): void;
}
export declare function createClusteredLightContainer(options?: ClusteredLightContainerOptions): ClusteredLightContainer;
export declare function createClusteredPointLight(container: ClusteredLightContainer, options: ClusteredPointLightOptions): ClusteredPointLight;
export declare function createClusteredSpotLight(container: ClusteredLightContainer, options: ClusteredSpotLightOptions): ClusteredSpotLight;
export declare function markClusteredLightContainerDirty(container: ClusteredLightContainer): void;
export declare function addClusteredLightContainer(scene: SceneContext, container: ClusteredLightContainer): void;
export interface _ClusteredSpotGpuSupport {
    readonly _stride: 3;
    _coneChanged(index: number, light: ClusteredSpotLight): boolean;
    _collect(activeLights: _ClusteredActiveLight[], lights: ClusteredSpotLight[], view: ArrayLike<number>): void;
    _write(data: Float32Array, offset: number, spot: ClusteredSpotLight | undefined): void;
    _markState(state: ClusteredLightGpuState): void;
}
export interface _ClusteredSpotSupport {
    _create(lightCount: number): _ClusteredSpotGpuSupport;
}
export interface _ClusteredActiveLight {
    light: ClusteredPointLight;
    depth: number;
    _spot?: ClusteredSpotLight;
}
export declare function buildClusteredLightGpuState(engine: EngineContext, scene: SceneContext, container: ClusteredLightContainer): ClusteredLightGpuState;
// light/directional-light.d.ts
import type { LightBase } from "./types.js";
import { ObservableVec3 } from "./light-base.js";
export interface DirectionalLight extends LightBase {
    readonly lightType: "directional";
    readonly direction: ObservableVec3;
    readonly position: ObservableVec3;
    diffuse: [number, number, number];
    specular: [number, number, number];
    intensity: number;
}
export declare function createDirectionalLight(direction: [number, number, number], intensity?: number): DirectionalLight;
// light/enable-rect-area-lights.d.ts
import type { SceneContext } from "../scene/scene.js";
import type { SceneLightingExtension } from "./lighting-extension.js";
declare let prepareEmission: ((scene: SceneContext, lighting: SceneLightingExtension) => Promise<void>) | null;
export declare function _installRectAreaEmission(prepare: NonNullable<typeof prepareEmission>): void;
export declare function enableRectAreaLights(scene: SceneContext): Promise<void>;
export {};
// light/hemispheric.d.ts
import type { LightBase } from "./types.js";
import { ObservableVec3 } from "./light-base.js";
export interface HemisphericLight extends LightBase {
    readonly lightType: "hemispheric";
    readonly direction: ObservableVec3;
    intensity: number;
    diffuseColor: [number, number, number];
    specularColor: [number, number, number];
    groundColor: [number, number, number];
}
export declare function createHemisphericLight(direction?: [number, number, number], intensity?: number): HemisphericLight;
// light/light-base.d.ts
import type { Mat4 } from "../math/types.js";
import type { SceneNode } from "../scene/scene-node.js";
import type { ObservableVec3 } from "../math/observable-vec3.js";
export { ObservableVec3 } from "../math/observable-vec3.js";
export interface LightVersionState {
    _lightVersion: number;
    b(): void;
}
export declare function createLightBase(position: readonly [number, number, number]): {
    node: SceneNode;
    lvs: LightVersionState;
};
export declare function writeWorldLightDirection(data: Float32Array, offset: number, world: Mat4, direction: ObservableVec3): void;
export declare function applyLightBase<R>(node: SceneNode, target: object, lvs?: LightVersionState): R;
// light/light-clone.d.ts
import type { LightBase } from "./types.js";
export declare function copyLightBase(source: LightBase, clone: LightBase): void;
// light/lighting-extension.d.ts
import type { StandardSceneShaderContext } from "../material/standard/standard-material.js";
import type { ShaderFragment } from "../shader/fragment-types.js";
import type { Mesh } from "../mesh/mesh.js";
export interface SingleLightShaderSource {
    SINGLE_LIGHT_STRUCTS: string;
    getSingleLightBlock(): string;
}
export interface MultiLightShaderSource {
    _helpers: string;
    _loop: string;
}
export interface SceneLightingExtension {
    _bindingId?: number;
    _prepare(): Promise<void>;
    _single?(type: string): SingleLightShaderSource | undefined;
    _multi?(): MultiLightShaderSource;
    _pbrFeatures?(mesh: Mesh): number;
    _standard?(fog: ShaderFragment | null): StandardSceneShaderContext;
    _validateNode?(usesLights: boolean): void;
}
// light/point-light.d.ts
import type { LightBase } from "./types.js";
import type { ObservableVec3 } from "./light-base.js";
export interface PointLight extends LightBase {
    readonly lightType: "point";
    readonly position: ObservableVec3;
    diffuse: [number, number, number];
    specular: [number, number, number];
    intensity: number;
    range: number;
}
export declare function createPointLight(position: [number, number, number], intensity?: number): PointLight;
// light/process-area-light-texture.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { Texture2D } from "../texture/texture-2d.js";
import type { SceneContext } from "../scene/scene.js";
import type { SceneLightingExtension } from "./lighting-extension.js";
export declare function prepareEmissionLighting(scene: SceneContext, lighting: SceneLightingExtension): Promise<void>;
export declare function processAreaLightTexture(engine: EngineContext, source: Texture2D): Promise<Texture2D>;
// light/rect-area-light.d.ts
import type { LightBase, LightBaseCopier } from "./types.js";
import type { Texture2D } from "../texture/texture-2d.js";
export interface RectAreaLight extends LightBase {
    readonly lightType: "rectArea";
    width: number;
    height: number;
    diffuse: [number, number, number];
    specular: [number, number, number];
    intensity: number;
    emissionTexture: Texture2D | null;
    _cloneNode?: (copyBase: LightBaseCopier) => RectAreaLight;
}
export declare function createRectAreaLight(position: [number, number, number], width: number, height: number, intensity?: number): RectAreaLight;
// light/set-light-diffuse-color.d.ts
import type { LightBase } from "./types.js";
export declare function setLightDiffuseColor(light: LightBase & {
    diffuse: [number, number, number];
}, color: readonly [number, number, number]): void;
// light/set-light-intensity.d.ts
import type { LightBase } from "./types.js";
export declare function setLightIntensity(light: LightBase & {
    intensity: number;
}, intensity: number): void;
// light/spot-light.d.ts
import type { LightBase } from "./types.js";
import { ObservableVec3 } from "./light-base.js";
export interface SpotLight extends LightBase {
    readonly lightType: "spot";
    readonly position: ObservableVec3;
    readonly direction: ObservableVec3;
    angle: number;
    exponent: number;
    diffuse: [number, number, number];
    specular: [number, number, number];
    intensity: number;
    range: number;
}
export declare function createSpotLight(position: [number, number, number], direction: [number, number, number], angle: number, exponent: number, intensity?: number): SpotLight;
// light/types.d.ts
import type { Mesh } from "../mesh/mesh.js";
import type { SceneNode } from "../scene/scene-node.js";
import type { SceneLightingExtension } from "./lighting-extension.js";
export type LightBaseCopier = (source: LightBase, clone: LightBase) => void;
export interface LightBase extends SceneNode {
    readonly lightType: string;
    excludedMeshIds?: ReadonlySet<string>;
    includedOnlyMeshIds?: ReadonlySet<string>;
    excludedMeshes?: ReadonlySet<Mesh>;
    includedOnlyMeshes?: ReadonlySet<Mesh>;
    shadowGenerator?: import("../shadow/shadow-generator.js").ShadowGenerator;
    readonly _writeLightUbo?: ((data: Float32Array, offset: number) => void) | undefined;
    readonly _lightVersion: number;
    readonly _bumpLightVersion?: (() => void) | undefined;
    readonly _validateLighting?: (extension: SceneLightingExtension | undefined) => void;
}
export declare let MAX_LIGHTS: number;
export declare function setMaxLights(n: number): void;
export declare const LIGHT_ENTRY_FLOATS = 16;
// shadow/csm-directional-shadow-generator.d.ts
import type { DirectionalLight } from "../light/directional-light.js";
import type { EngineContext } from "../engine/engine.js";
import type { ShadowGenerator } from "./shadow-generator.js";
import type { Texture2D } from "../texture/texture-2d.js";
export interface CsmDirectionalShadowGeneratorConfig {
    mapSize?: number;
    numCascades?: number;
    lambda?: number;
    cascadeBlendPercentage?: number;
    stabilizeCascades?: boolean;
    shadowMaxZ?: number;
    bias?: number;
    worldSpaceBias?: number;
    darkness?: number;
    frustumEdgeFalloff?: number;
    forceRefreshEveryFrame?: boolean;
}
export declare function createCsmDirectionalShadowGenerator(engine: EngineContext, _light: DirectionalLight, cfg?: CsmDirectionalShadowGeneratorConfig): ShadowGenerator;
export declare function getCsmReceiverTexture(sg: ShadowGenerator): Texture2D;
export declare function onCsmReceiverUpdate(sg: ShadowGenerator, cb: (data: Float32Array) => void): () => void;
// shadow/csm-receiver-registry.d.ts
import type { ShaderFragment } from "../shader/fragment-types.js";
type StdCsmReceiverFactory = (slots: {
    lightIndex: number;
}[]) => ShaderFragment;
export declare function setCsmStdReceiverFactory(f: StdCsmReceiverFactory): void;
export declare function getCsmStdReceiverFactory(): StdCsmReceiverFactory | null;
type PbrCsmReceiverFactory = (slots: {
    lightIndex: number;
}[]) => ShaderFragment;
export declare function setCsmPbrReceiverFactory(f: PbrCsmReceiverFactory): void;
export declare function getCsmPbrReceiverFactory(): PbrCsmReceiverFactory | null;
export {};
// shadow/csm-refit-gate.d.ts
export interface CsmRefitCaster {
    readonly worldMatrixVersion: number;
    readonly thinInstances?: {
        readonly _version: number;
    } | null | undefined;
}
export interface CsmRefitGateOptions {
    refitAngle: number;
    refitMaxIntervalMs: number;
    demoteQuietFrames?: number;
}
export interface CsmRefitDecision {
    refit: boolean;
    renderDynamic: boolean;
}
export interface CsmRefitGate<M extends CsmRefitCaster> {
    syncCasters(casters: readonly M[]): void;
    markDynamic(caster: M): void;
    isDynamic(caster: M): boolean;
    _lastRefitDriftOnly(): boolean;
    _lastDynamicChanged(): boolean;
    update(lightDirX: number, lightDirY: number, lightDirZ: number, nowMs: number, cameraChanged: boolean, force: boolean, onPromote: (caster: M) => void, onDemote: (caster: M) => void): CsmRefitDecision;
}
export declare function createCsmRefitGate<M extends CsmRefitCaster>(options: CsmRefitGateOptions): CsmRefitGate<M>;
export interface CsmStaticRefitScheduler {
    arm(spread: boolean): void;
    pending(): boolean;
    take(): number[];
    claim(cascade: number): void;
    maxLagFrames(): number;
}
export declare function createCsmStaticRefitScheduler(cascadeCount: number, cascadesPerFrame: number): CsmStaticRefitScheduler;
// shadow/csm-shadow-cache.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { Mesh } from "../mesh/mesh.js";
import type { SceneContext } from "../scene/scene-core.js";
import { type RenderTask } from "../frame-graph/render-task.js";
import { type CsmConfig, type CsmTaskState } from "./csm-shadow-task-hooks.js";
import type { ShadowGenerator, ShadowTaskInternalState } from "./shadow-generator.js";
export declare function rebuildTransferTarget(to: RenderTask): void;
export declare function transferMeshBetweenTasks(from: RenderTask, to: RenderTask, mesh: object, pendingTargets?: Set<RenderTask>): void;
export declare function ensureCsmShadowCacheState(engine: EngineContext, scene: SceneContext, sg: ShadowGenerator, cfg: CsmConfig, casterMeshes: readonly Mesh[], existingState: ShadowTaskInternalState | null): CsmTaskState;
export declare function renderCsmShadowMapCached(engine: EngineContext, sg: ShadowGenerator, state: CsmTaskState, cfg: CsmConfig): number;
// shadow/csm-shadow-task-hooks.d.ts
import type { Camera } from "../camera/camera.js";
import type { DirectionalLight } from "../light/directional-light.js";
import type { EngineContext } from "../engine/engine.js";
import type { Material, MaterialView } from "../material/material.js";
import type { Mesh } from "../mesh/mesh.js";
import type { SceneContext } from "../scene/scene-core.js";
import { type RenderTask } from "../frame-graph/render-task.js";
import { preloadPcfShadowTaskState } from "./pcf-shadow-task-hooks.js";
import type { ShadowGenerator, ShadowTaskInternalState } from "./shadow-generator.js";
export interface CsmConfig {
    _numCascades: number;
    _lambda: number;
    _cascadeBlendPercentage: number;
    _stabilizeCascades: boolean;
    _shadowMaxZ: number | null;
    _bias: number;
    _worldSpaceBias: number | null;
    _darkness: number;
    _frustumEdgeFalloff: number;
    _mapSize: number;
    _forceRefreshEveryFrame: boolean;
}
export interface CsmTaskState extends ShadowTaskInternalState {
    _tasks: RenderTask[];
    _cameras: Camera[];
    _scene: SceneContext;
    _lastCasterVersion: number;
    _lastLightVersion: number;
    _lastCamVersion: number;
    _lastCamera: Camera | null;
    _lastCamAspect: number;
    _uboData: Float32Array;
    _casterMeshes: readonly Mesh[];
    _materialViews: Map<Material, MaterialView>;
    _casterMaterials: Map<Material, Material>;
    _casterMatGens: Map<Material, number | undefined>;
    _casterMatFeatures: Map<Material, unknown>;
    _casterMaxCascades: Map<Mesh, number | undefined>;
    _casterGens: Map<Mesh, number | undefined>;
    _held?: Set<Mesh>;
    _cascadeScratch: CsmCascadeScratch;
}
interface CsmCascadeScratch {
    _cascades: CsmCascades;
    _view: Float32Array;
    _invViewProj: Float32Array;
    _corners: number[][];
    _aabb: number[];
}
export declare const preloadCsmShadowTaskState: typeof preloadPcfShadowTaskState;
export declare function _createCascadeScratch(n: number): CsmCascadeScratch;
export declare function ensureCsmShadowTaskState(engine: EngineContext, scene: SceneContext, sg: ShadowGenerator, cfg: CsmConfig, casterMeshes: readonly Mesh[], existingState: ShadowTaskInternalState | null): CsmTaskState;
export declare function _reconcileCsmCasters(scene: SceneContext, sg: ShadowGenerator, state: CsmTaskState, casterMeshes: readonly Mesh[]): ReadonlySet<Mesh> | undefined;
export declare function _dropTaskMeshes(task: RenderTask, drop: ReadonlySet<Mesh | undefined>): void;
export declare function renderCsmShadowMap(engine: EngineContext, sg: ShadowGenerator, state: CsmTaskState, cfg: CsmConfig): number;
export interface CsmCascades {
    _transforms: Float32Array[];
    _views: Float32Array[];
    _near: number[];
    _far: number[];
    _viewFrustumZ: number[];
    _frustumLengths: number[];
}
export declare function buildLightViewMatrixInto(out: Float32Array, dirX: number, dirY: number, dirZ: number, px: number, py: number, pz: number): void;
export declare function csmCameraAspect(scene: SceneContext, camera: Camera): number;
export declare function _csmSliceCornersInto(corners: number[][], invViewProj: ArrayLike<number>, nearSplit: number, farSplit: number): void;
export declare function _computeCsmCascades(scene: SceneContext, camera: Camera, light: DirectionalLight, cfg: CsmConfig, casterMeshes: readonly Mesh[], scratch: CsmCascadeScratch, radiusScale?: number): CsmCascades;
export declare function _writeCsmUbo(out: Float32Array, cascades: CsmCascades, cfg: CsmConfig): void;
export declare function csmWorldBiasClipOffset(worldSpaceBias: number, near: number, far: number): number;
export declare function _biasViewProjection(matrix: Float32Array, clipOffset: number): void;
export {};
// shadow/deformable-shadow-casters.d.ts
import type { Aabb } from "../math/aabb.js";
import type { Mesh } from "../mesh/mesh.js";
import type { ShadowGenerator } from "./shadow-generator.js";
export type DeformableShadowBoundsKind = "skeleton" | "morph";
export interface DeformableShadowBoundsProvider {
    readonly kind: DeformableShadowBoundsKind;
    applies(mesh: Mesh): boolean;
    getLocalBounds(mesh: Mesh, bounds?: Aabb | null): Aabb | null;
}
export declare function getPreviousDeformableShadowBounds(generator: ShadowGenerator, mesh: Mesh, kind: DeformableShadowBoundsKind): Aabb | null;
export declare function enableDeformableShadowBounds(generator: ShadowGenerator, provider: DeformableShadowBoundsProvider): void;
// shadow/enable-csm-static-cache.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { ShadowGenerator } from "./shadow-generator.js";
export interface CsmStaticCacheOptions {
    refitAngle: number;
    refitMaxIntervalMs?: number;
    staticCascadesPerFrame?: number;
    cascadeCoveragePadding?: number;
}
export declare function enableCsmStaticCache(engine: EngineContext, sg: ShadowGenerator, options: CsmStaticCacheOptions): Promise<void>;
// shadow/enable-morph-target-shadows.d.ts
import type { ShadowGenerator } from "./shadow-generator.js";
export declare function enableMorphTargetShadows(generator: ShadowGenerator): void;
// shadow/enable-skeleton-shadows.d.ts
import type { ShadowGenerator } from "./shadow-generator.js";
export declare function enableSkeletonShadows(generator: ShadowGenerator): void;
// shadow/esm-directional-shadow-generator.d.ts
import type { Camera } from "../camera/camera.js";
import type { EngineContext } from "../engine/engine.js";
import type { DirectionalLight } from "../light/directional-light.js";
import type { Mesh } from "../mesh/mesh.js";
import type { SceneContext } from "../scene/scene-core.js";
import { type RenderTask } from "../frame-graph/render-task.js";
import type { ShadowGenerator, ShadowTaskInternalState } from "./shadow-generator.js";
export interface EsmLightMatrix {
    _view: Float32Array;
    _viewProj: Float32Array;
    _near: number;
    _far: number;
}
export interface EsmShadowTaskResources {
    _esmTexture: GPUTexture;
    _depthBuffer: GPUTexture;
    _blurTexH: GPUTexture;
    _blurPipeline: GPURenderPipeline;
    _blurHBG: GPUBindGroup;
    _blurVBG: GPUBindGroup;
    _shadowUboData: Float32Array;
    _blurKernel: number;
    _blurScale: number;
}
export interface EsmDirectionalShadowGeneratorConfig {
    mapSize?: number;
    depthScale?: number;
    bias?: number;
    blurKernel?: number;
    blurScale?: number;
    darkness?: number;
    frustumEdgeFalloff?: number;
    orthoMinZ?: number;
    orthoMaxZ?: number;
    forceRefreshEveryFrame?: boolean;
}
interface EsmTaskState extends ShadowTaskInternalState {
    _task: RenderTask;
    _camera: Camera;
    _lastCasterVersion: number;
    _lastLightVersion: number;
    _lastFoVersion: number;
    _lastFoCamera?: Camera | null;
    _casterMeshes: readonly Mesh[];
    _scene: SceneContext;
}
export declare function setEsmShadowTaskResources(sg: ShadowGenerator, resources: EsmShadowTaskResources): void;
export declare function getEsmShadowTaskResources(sg: ShadowGenerator): EsmShadowTaskResources | null;
export declare function ensureEsmShadowTaskState(engine: EngineContext, scene: SceneContext, sg: ShadowGenerator, casterMeshes: readonly Mesh[], existingState: ShadowTaskInternalState | null): EsmTaskState;
export declare function createEsmDirectionalShadowGenerator(engine: EngineContext, _light: DirectionalLight, cfg?: EsmDirectionalShadowGeneratorConfig): ShadowGenerator;
export {};
// shadow/material-shadow-bindings.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { ShadowGenerator } from "./shadow-generator.js";
export type MaterialShadowBindings = (layout: GPUBindGroupLayout) => GPUBindGroup;
export declare function createMaterialShadowBindings(engine: EngineContext, lights: readonly {
    readonly gen: ShadowGenerator;
}[]): MaterialShadowBindings;
// shadow/pcf-directional-shadow-generator.d.ts
import type { DirectionalLight } from "../light/directional-light.js";
import type { EngineContext } from "../engine/engine.js";
import type { ShadowGenerator } from "./shadow-generator.js";
export interface PcfDirectionalShadowGeneratorConfig {
    mapSize?: number;
    bias?: number;
    darkness?: number;
    normalBias?: number;
    orthoMinZ?: number;
    orthoMaxZ?: number;
    forceRefreshEveryFrame?: boolean;
}
export declare function createPcfDirectionalShadowGenerator(engine: EngineContext, _light: DirectionalLight, cfg?: PcfDirectionalShadowGeneratorConfig): ShadowGenerator;
// shadow/pcf-shadow-task-hooks.d.ts
import type { Camera } from "../camera/camera.js";
import type { EngineContext } from "../engine/engine.js";
import type { Material, MaterialView } from "../material/material.js";
import type { Mesh } from "../mesh/mesh.js";
import type { SceneContext } from "../scene/scene-core.js";
import { type RenderTask } from "../frame-graph/render-task.js";
import type { ShadowGenerator, ShadowTaskInternalState } from "./shadow-generator.js";
export interface PcfLightMatrix {
    _view: Float32Array;
    _viewProj: Float32Array;
    _near: number;
    _far: number;
}
export interface PcfTaskState extends ShadowTaskInternalState {
    _task: RenderTask;
    _camera: Camera;
    _lastCasterVersion: number;
    _lastLightVersion: number;
    _lastFoVersion: number;
    _lastFoCamera?: Camera | null;
    _shadowUboData: Float32Array;
    _casterMeshes: readonly Mesh[];
    _casterMaterials: (Material | null)[];
    _casterMatGens: number[];
    _casterMeshGens: (number | undefined)[];
    _casterMatFeatures: unknown[];
    _held?: Set<Mesh>;
    _scene: SceneContext;
}
export declare function preloadPcfShadowTaskState(casterMeshes: readonly Mesh[]): Promise<void>;
export declare function ensurePcfShadowTaskState(engine: EngineContext, scene: SceneContext, sg: ShadowGenerator, casterMeshes: readonly Mesh[], existingState: ShadowTaskInternalState | null): PcfTaskState;
export declare function holdShadowCaster(scene: SceneContext, sg: ShadowGenerator, material: Material): boolean;
export declare function resolveShadowCasterMaterial(material: Material): Material;
export declare function snapshotShadowCasterMaterial(material: Material, terminals: Map<Material, Material>, generations: Map<Material, number | undefined>, features: Map<Material, unknown>): void;
export declare function shadowCasterMaterialChanged(material: Material, terminals: Map<Material, Material>, generations: Map<Material, number | undefined>, features: Map<Material, unknown>): boolean;
export declare function renderPcfShadowMap(engine: EngineContext, sg: ShadowGenerator, state: PcfTaskState, computeLightMatrix: (casterMeshes: readonly Mesh[], offX: number, offY: number, offZ: number) => PcfLightMatrix): number;
export declare function getNoColorView(material: Material, cache: Map<Material, MaterialView>): MaterialView;
// shadow/pcf-spotlight-shadow-generator.d.ts
import type { SpotLight } from "../light/spot-light.js";
import type { EngineContext } from "../engine/engine.js";
import type { ShadowGenerator } from "./shadow-generator.js";
import { type PcfLightMatrix } from "./pcf-shadow-task-hooks.js";
export interface PcfSpotlightShadowGeneratorConfig {
    mapSize?: number;
    bias?: number;
    darkness?: number;
    normalBias?: number;
    near?: number;
    far?: number;
    forceRefreshEveryFrame?: boolean;
}
export declare function _computeSpotLightMatrix(light: SpotLight, near: number, far: number, offX?: number, offY?: number, offZ?: number): PcfLightMatrix;
export declare function createPcfSpotlightShadowGenerator(engine: EngineContext, _light: SpotLight, cfg?: PcfSpotlightShadowGeneratorConfig): ShadowGenerator;
// shadow/shadow-base.d.ts
import type { Camera } from "../camera/camera.js";
import type { EngineContext } from "../engine/engine.js";
import type { RenderTarget } from "../engine/render-target.js";
import type { DirectionalLight } from "../light/directional-light.js";
import type { Mesh } from "../mesh/mesh.js";
import type { ShadowGenerator } from "./shadow-generator.js";
export declare function writeShadowUboFields(out: Float32Array, sg: {
    _lightMatrix: Float32Array;
    _depthValues: Float32Array;
    _shadowsInfo: Float32Array;
}): void;
export declare function buildLightViewMatrix(dirX: number, dirY: number, dirZ: number, px: number, py: number, pz: number): Float32Array;
export declare function multiply4x4(a: Float32Array, b: Float32Array): Float32Array;
export declare function computeDirectionalLightMatrix(light: DirectionalLight, casterMeshes: readonly Mesh[], orthoMinZ: number, orthoMaxZ: number, offX?: number, offY?: number, offZ?: number): {
    _view: Float32Array;
    _viewProj: Float32Array;
    _near: number;
    _far: number;
};
export declare function createShadowParamsUBO(engine: EngineContext, bias: number, depthScale: number): GPUBuffer;
export declare function createShadowRenderTarget(sg: ShadowGenerator, colorTexture?: GPUTexture | null, depthTexture?: GPUTexture): RenderTarget;
export declare function createSharedShadowUBO(engine: EngineContext, _lightMatrix: Float32Array, _depthValues: Float32Array, _shadowsInfo: Float32Array): {
    ubo: GPUBuffer;
    data: Float32Array;
};
export declare function casterVersionSum(casterMeshes: readonly Mesh[]): number;
export declare function createShadowCamera(sg: Pick<ShadowGenerator, "_light">): Camera;
export declare function updateShadowCameraBase(camera: Camera, cameraVersion: number, near: number, far: number, view: Float32Array, viewProj: Float32Array): void;
// shadow/shadow-enabled.d.ts
import type { ShadowGenerator } from "./shadow-generator.js";
export declare function setShadowGeneratorEnabled(generator: ShadowGenerator, enabled: boolean): void;
// shadow/shadow-generator.d.ts
import type { Texture2D } from "../texture/texture-2d.js";
interface ShadowGeneratorRuntimeConfig {
    _mapSize: number;
    _bias: number;
    _orthoMinZ?: number;
    _orthoMaxZ?: number;
    _forceRefreshEveryFrame: boolean;
}
export interface ShadowTaskInternalState {
    _task: {
        record(): void;
        execute?(): number;
        dispose(): void;
    };
    _casterMeshes: readonly import("../mesh/mesh.js").Mesh[];
    _recordedVersion?: number;
}
export interface ShadowGeneratorEnabledState {
    enabled: boolean;
    uploadedEnabled?: boolean;
    uploadedUbo?: GPUBuffer;
    readonly uploadData: Float32Array;
    renderShadowMap(engine: import("../engine/engine.js").EngineContext, state: ShadowTaskInternalState): number;
}
export interface ShadowGenerator {
    _shadowType: "esm" | "pcf" | "csm";
    _light: import("../light/types.js").LightBase;
    _depthTexture: GPUTexture;
    _csmCascadeCount?: number;
    _csmReceiverTexture?: Texture2D;
    _depthSampler: GPUSampler;
    _lightMatrix: Float32Array;
    _shadowsInfo: Float32Array;
    _depthValues: Float32Array;
    _shadowParamsUBO: GPUBuffer;
    _shadowUBO: GPUBuffer;
    _config: ShadowGeneratorRuntimeConfig;
    _version: number;
    _shadowTaskState?: ShadowTaskInternalState;
    _runtimeEnabledState?: ShadowGeneratorEnabledState;
    _csmCache?: {
        _refitAngle: number;
        _refitMaxIntervalMs: number;
        _staticCascadesPerFrame?: number;
        _cascadeCoveragePadding?: number;
        _loaded?: boolean;
    };
    _onReceiverData?: ((data: Float32Array) => void)[];
    _preloadShadowTask?(casterMeshes: readonly import("../mesh/mesh.js").Mesh[]): Promise<void>;
    _preloadPending?: readonly import("../mesh/mesh.js").Mesh[];
    _ensureShadowTaskState?(engine: import("../engine/engine.js").EngineContext, scene: import("../scene/scene-core.js").SceneContext, casterMeshes: readonly import("../mesh/mesh.js").Mesh[]): ShadowTaskInternalState;
    _renderShadowMap?(engine: import("../engine/engine.js").EngineContext, state: ShadowTaskInternalState): number;
    _replaceShadowTaskHooks?(ensure: NonNullable<ShadowGenerator["_ensureShadowTaskState"]>, render: NonNullable<ShadowGenerator["_renderShadowMap"]>): void;
}
export {};
// shadow/shadow-recovery.d.ts
import type { EngineContext } from "../engine/engine.js";
import type { SceneContext } from "../scene/scene-core.js";
export declare function rebuildSceneShadowGenerators(engine: EngineContext, scene: SceneContext): Promise<void>;
// shadow/shadow-renderable.d.ts
// scene/mesh-scene-registry.d.ts
import type { Mesh } from "../mesh/mesh.js";
import type { SceneContext } from "./scene-core.js";
export declare function _installMeshMaterialValidator(validate: (mesh: Mesh, material: Mesh["material"]) => void): void;
export declare function enqueueMaterialSwap(scene: SceneContext, mesh: Mesh): void;
export declare function markMeshRenderableDirty(mesh: Mesh): void;
export declare function _getMeshScenes(mesh: Mesh): ReadonlySet<SceneContext> | undefined;
export declare function registerMeshScene(scene: SceneContext, mesh: Mesh): void;
export declare function unregisterMeshScene(scene: SceneContext, mesh: Mesh): boolean;
// scene/overlay-scene.d.ts
import type { SceneContext } from "./scene-core.js";
export declare function moveSwapchainOverlaysAfterBase(scene: SceneContext): void;
export declare function createOverlayScene(baseScene: SceneContext): SceneContext;
// scene/parentable.d.ts
import type { Mat4 } from "../math/types.js";
export interface IWorldMatrixProvider {
    readonly worldMatrix: Mat4;
    readonly worldMatrixVersion: number;
}
export interface IParentable {
    parent: IWorldMatrixProvider | null;
}
// scene/scene-camera.d.ts
import type { SceneContext } from "./scene-core.js";
import type { ArcRotateCamera } from "../camera/arc-rotate.js";
export declare function createDefaultCamera(scene: SceneContext): ArcRotateCamera;
// scene/scene-change.d.ts
import type { SceneChangeEvent, SceneChangeListener, SceneContext } from "./scene-core.js";
export interface SceneChangeState {
    listeners: Set<SceneChangeListener>;
    pending: SceneChangeEvent[];
    members: WeakSet<object>;
    depth: number;
    dispatching: boolean;
}
export declare function onSceneChange(scene: SceneContext, listener: SceneChangeListener): () => void;
export declare function onSceneDispose(scene: SceneContext, callback: () => void): () => void;
// scene/scene-core.d.ts
import type { EngineContext, RenderingContext } from "../engine/engine.js";
import type { SurfaceContext } from "../engine/surface.js";
import type { Camera } from "../camera/camera.js";
import type { LightBase } from "../light/types.js";
import type { Mesh } from "../mesh/mesh.js";
import type { AnimationGroup } from "../animation/animation-group.js";
import type { ShadowGenerator } from "../shadow/shadow-generator.js";
import type { FogConfig } from "../material/standard/standard-material.js";
import type { Renderable, PrePassRenderable, SceneUniformUpdater, MeshGroupBuilder } from "../render/renderable.js";
import type { TransformNode } from "./transform-node.js";
import type { EnvironmentTextures } from "../loader-env/load-env.js";
import type { EnvironmentRecoverySource } from "../loader-env/environment-recovery.js";
import type { FrameGraph } from "../frame-graph/frame-graph.js";
import type { AssetContainer } from "../asset-container.js";
import type { SceneLightGpuState } from "../render/scene-lights-ubo.js";
import type { ClusteredLightContainer } from "../light/clustered.js";
import type { FgRuntime } from "../flow-graph/runtime.js";
import type { PickSource } from "../picking/pick-contributor.js";
import type { ToneMapping } from "../material/pbr/tone-mapping.js";
import type { FgEventBus } from "../flow-graph/event-bus.js";
import type { MeshLoDSceneRegistry } from "../mesh-lod/mesh-lod-scene.js";
import type { Material } from "../material/material.js";
import type { SceneChangeState } from "./scene-change.js";
import type { SceneLightingExtension } from "../light/lighting-extension.js";
import type { ParticleSystem } from "../particle/particle-system.js";
import type { PhysicsWorld } from "../physics/havok.js";
export interface ImageProcessingConfig {
    exposure: number;
    contrast: number;
    toneMappingEnabled: boolean;
    toneMapping?: ToneMapping;
}
export type ClipPlane = readonly [number, number, number, number];
export type EnvironmentSkyboxKind = "dds" | "hdr";
export interface EnvironmentSkyboxShaderPatch {
    _apply(fragment: string, kind: EnvironmentSkyboxKind): string;
}
export type EnvironmentSkyboxShaderPatchLoader = () => EnvironmentSkyboxShaderPatch | Promise<EnvironmentSkyboxShaderPatch>;
export type EnvironmentSkyboxShaderComposer = (fragment: string, kind: EnvironmentSkyboxKind) => Promise<string>;
export interface RuntimeSceneBuildHooks {
    queue(builder: MeshGroupBuilder, mesh: Mesh): Promise<void>;
    all(): Promise<void>;
    track(promise: Promise<void>): Promise<void>;
    base(builder: MeshGroupBuilder, rebuild: NonNullable<MeshGroupBuilder["_rebuildSingle"]>): NonNullable<MeshGroupBuilder["_rebuildSingle"]>;
    readonly w: boolean;
    pendingDisposers(mesh: Mesh): (() => void)[] | undefined;
    holdPendingDisposers(mesh: Mesh, disposers: (() => void)[]): void;
    releasePendingDisposers(mesh: Mesh, disposers: (() => void)[]): void;
    reset(mesh: Mesh): void;
    remove(mesh: Mesh): void;
    dropBase(builder: MeshGroupBuilder): void;
    wait(meshes: readonly Mesh[]): Promise<void>;
    _e(clear?: boolean): void;
    _x(error: unknown): void;
    _d(): boolean;
    exclusive<T>(builder: MeshGroupBuilder, work: () => Promise<T>): Promise<T>;
    _n?: Promise<void>;
    _l?: Promise<void>;
}
export interface SceneMeshGroup extends Array<Mesh> {
    r?: NonNullable<MeshGroupBuilder["_rebuildSingle"]>;
    o?: Renderable[];
    _w?: ((mesh: Mesh) => unknown) | null;
}
export type SceneEntity = Mesh | LightBase | Camera | ShadowGenerator | TransformNode | AssetContainer;
export interface SceneChangeEvent {
    readonly type: "added" | "removed";
    readonly entity: SceneEntity;
}
export type SceneChangeListener = (event: SceneChangeEvent) => void;
interface SceneChangeHook {
    run(scene: SceneContext, mutation: () => void): void;
    record(scene: SceneContext, entity: SceneEntity, type: SceneChangeEvent["type"]): void;
    dispose(scene: SceneContext): void;
}
export declare function _setSceneChangeHook(hook: SceneChangeHook): void;
export declare function _setSceneDisposeHook(hook: (scene: SceneContext, cleanup: () => void) => void): void;
export interface SceneContext extends RenderingContext {
    readonly _kind: "scene";
    name?: string;
    readonly surface: SurfaceContext;
    clearColor: GPUColorDict;
    camera: Camera | null;
    lights: LightBase[];
    _lighting?: SceneLightingExtension;
    imageProcessing: ImageProcessingConfig;
    meshes: Mesh[];
    animationGroups: AnimationGroup[];
    fog: FogConfig | null;
    clipPlane: ClipPlane | null;
    shadowGenerators: ShadowGenerator[];
    environmentPrimaryColor?: [number, number, number];
    _environmentRotation?: number;
    _environmentBlur?: number;
    _environmentSkyboxShaderPatchLoaders?: EnvironmentSkyboxShaderPatchLoader[];
    _environmentSkyboxShaderComposer?: EnvironmentSkyboxShaderComposer;
    fixedDeltaMs: number;
    _renderables: Renderable[];
    _prePasses: PrePassRenderable[];
    _pickSources: PickSource[];
    _uniformUpdaters: SceneUniformUpdater[];
    _sceneUboContributors?: ((data: Float32Array, scene: SceneContext) => void)[];
    _beforeRender: ((deltaMs: number) => void)[];
    _overlayBase?: SceneContext;
    _particleSystems?: ParticleSystem[];
    _physicsWorlds?: PhysicsWorld[];
    _sceneChanges?: SceneChangeState;
    _deferredBuilders: (() => void | Promise<void>)[];
    _groups: Map<MeshGroupBuilder, SceneMeshGroup>;
    _lightListVersion?: number;
    _rebuildHook?: (scene: SceneContext) => Promise<void>;
    _pendingTopologyRetirements?: (() => void)[];
    _runtimeBuilds?: RuntimeSceneBuildHooks;
    _z?: boolean;
    _p?: (value: readonly [commit: () => void, rollback: () => void]) => boolean;
    _disposables: (() => void)[];
    _meshDisposables: Map<Mesh, (() => void)[]>;
    _meshMaterialChange?: (mesh: Mesh, material?: Mesh["material"]) => void;
    _materialSwapQueue: Mesh[];
    _renderableVersion: number;
    _materialEpoch: number;
    _built: boolean;
    _envTextures?: EnvironmentTextures;
    _envRecoverySource?: EnvironmentRecoverySource;
    _lightGpuState?: SceneLightGpuState;
    _frameGraph: FrameGraph;
    _clusteredLightContainer?: ClusteredLightContainer;
    _clusteredLightUpdater?: (camera: Camera | null | undefined, targetWidth: number, targetHeight: number) => void;
    _flowGraphs?: FgRuntime[];
    _flowGraphBus?: FgEventBus;
    _flowGraphTick?: (deltaMs: number) => void;
    _flowGraphDispose?: () => void;
    _flowGraphPointerInit?: Promise<void>;
    _flowGraphPointerCleanup?: () => void;
    _flowGraphPointerRefresh?: () => void;
    _meshLoDRegistry?: MeshLoDSceneRegistry;
    _materialRebuild?: (matches: (material: Material) => boolean) => Promise<void>;
}
export interface SceneContextOptions {
    defaultRenderTask?: boolean;
}
export declare function createSceneContext(surface: SurfaceContext, options?: SceneContextOptions): SceneContext;
export declare function onBeforeRender(scene: SceneContext, cb: (deltaMs: number) => void): void;
export declare function _hasSceneChangeHook(): boolean;
export declare function _runSceneChange(scene: SceneContext, mutation: () => void): void;
export declare function _notifySceneChange(scene: SceneContext, entity: SceneEntity, type: SceneChangeEvent["type"]): void;
export declare function getFrameGraph(scene: SceneContext): FrameGraph;
export interface DeferredSceneRenderables {
    renderables: readonly Renderable[];
    dispose?: () => void;
}
export declare function addDeferredSceneRenderables(scene: SceneContext, build: (engine: EngineContext, scene: SceneContext) => DeferredSceneRenderables | Promise<DeferredSceneRenderables>): void;
export declare function addToScene(scene: SceneContext, entity: SceneEntity): void;
export declare function disposeScene(scene: SceneContext): void;
export declare function buildScene(scene: SceneContext): Promise<void>;
export declare function _installAsyncShaderPipelinePreparation(prepare: (scene: SceneContext) => Promise<void>): void;
export declare function _installOverlaySceneRegistration(registered: (scene: SceneContext) => void): void;
export declare function registerScene(scene: SceneContext): Promise<void>;
export declare function registerSceneWithShadowSupport(scene: SceneContext): Promise<void>;
export declare function unregisterScene(scene: SceneContext): void;
export {};
// scene/scene-image-processing.d.ts
import type { ImageProcessingConfig, SceneContext } from "./scene-core.js";
export type ImageProcessingUpdate = Partial<ImageProcessingConfig>;
export declare function setSceneImageProcessing(scene: SceneContext, update: ImageProcessingUpdate): Promise<void>;
// scene/scene-material-swap.d.ts
import type { SceneContext } from "./scene-core.js";
export declare function processMaterialSwaps(scene: SceneContext): Promise<void> | void;
// scene/scene-node.d.ts
import type { Mat4, Quat, Vec3 } from "../math/types.js";
import type { LiteMetadata } from "../metadata.js";
import type { IWorldMatrixProvider } from "./parentable.js";
import type { LightBaseCopier } from "../light/types.js";
import { ObservableVec3 } from "../math/observable-vec3.js";
import { ObservableQuat } from "../math/observable-quat.js";
export interface EulerProxy {
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): void;
}
export interface SceneNode {
    name: string;
    children: SceneNode[];
    readonly position: ObservableVec3;
    readonly rotationQuaternion: ObservableQuat;
    readonly rotation: EulerProxy;
    readonly scaling: ObservableVec3;
    parent: IWorldMatrixProvider | null;
    readonly worldMatrix: Mat4;
    readonly worldMatrixVersion: number;
    _localMatrix?: Mat4;
    _localMatrixLocked?: boolean;
    readonly visible?: boolean;
    metadata?: LiteMetadata;
    _cloneNode?: (copyLightBase: LightBaseCopier) => SceneNode;
}
export interface _WritableVisibility {
    visible?: boolean;
}
export declare function createEulerProxy(rq: ObservableQuat): EulerProxy;
export declare function createSceneNode(name: string, px?: number, py?: number, pz?: number, qx?: number, qy?: number, qz?: number, qw?: number, sx?: number, sy?: number, sz?: number): SceneNode;
export declare function createSceneNodeFromMatrix(name: string, matrix: Mat4, translation?: Vec3, rotation?: Quat, scale?: Vec3): SceneNode;
export declare function initSceneNodeTransform<T extends SceneNode>(partialNode: Partial<T>, px?: number, py?: number, pz?: number, qx?: number, qy?: number, qz?: number, qw?: number, sx?: number, sy?: number, sz?: number): T;
// scene/scene-rebuild.d.ts
import type { SceneContext } from "./scene-core.js";
export declare function rebuildScenePbrPipelines(scene: SceneContext, force?: boolean): Promise<void>;
export declare function rebuildSceneRenderables(scene: SceneContext): Promise<void>;
// scene/scene-remove.d.ts
import type { SceneContext, SceneEntity } from "./scene-core.js";
export declare function removeFromScene(scene: SceneContext, entity: SceneEntity): void;
// scene/scene-runtime-mesh-build.d.ts
import type { Mesh } from "../mesh/mesh.js";
import type { MeshGroupBuilder } from "../render/renderable.js";
import type { SceneContext } from "./scene-core.js";
import type { Material } from "../material/material.js";
export declare function A(scene: SceneContext, material: Material | null, mesh: Mesh, pending?: Promise<void>): Promise<void>;
export declare function C(scene: SceneContext, meshes: readonly (Mesh | [Mesh, Material])[], pending?: Promise<void>): Promise<void>;
export declare function B(scene: SceneContext, builder: MeshGroupBuilder, mesh: Mesh): Promise<void>;
export declare function X<T>(scene: SceneContext, builder: MeshGroupBuilder, work: () => Promise<T>): Promise<T>;
// scene/scene-ubo-extras.d.ts
import type { SceneContext, ClipPlane } from "./scene-core.js";
import type { FogConfig } from "../material/standard/standard-material.js";
type SceneUboContributor = (data: Float32Array, scene: SceneContext) => void;
export declare function _registerSceneUboContributor(scene: SceneContext, contributor: SceneUboContributor): void;
export declare function _invalidateSceneUboCaches(scene: SceneContext): void;
export declare function setFog(scene: SceneContext, config: FogConfig): void;
export declare function setClipPlane(scene: SceneContext, plane: ClipPlane): void;
export declare function registerEnvSceneUniforms(scene: SceneContext): void;
export {};
// scene/scene.d.ts
export { createSceneContext, onBeforeRender, addToScene, disposeScene, buildScene, registerScene, registerSceneWithShadowSupport, unregisterScene } from "./scene-core.js";
export { onSceneChange, onSceneDispose } from "./scene-change.js";
export { processMaterialSwaps } from "./scene-material-swap.js";
export type { SceneContext, SceneContextOptions, SceneEntity, SceneChangeEvent, SceneChangeListener, ImageProcessingConfig, ClipPlane } from "./scene-core.js";
export { createDefaultCamera } from "./scene-camera.js";
export { removeFromScene } from "./scene-remove.js";
export { setSubtreeVisible as setMeshVisible } from "./visibility.js";
export { getFrameGraph } from "./scene-core.js";
// scene/set-environment-blur.d.ts
import type { SceneContext } from "./scene-core.js";
export declare function setEnvironmentBlur(scene: SceneContext, blur: number): void;
// scene/set-environment-rotation.d.ts
import type { SceneContext } from "./scene-core.js";
export declare function setEnvironmentRotation(scene: SceneContext, rotation: number): void;
export declare function setEnvironmentLightingRotation(scene: SceneContext, rotation: number): void;
export declare function setEnvironmentSkyboxRotation(scene: SceneContext, rotation: number): void;
// scene/set-parent.d.ts
import type { Mesh } from "../mesh/mesh.js";
import type { SceneNode } from "./scene-node.js";
import type { IWorldMatrixProvider } from "./parentable.js";
export declare function setParent(child: Mesh, parent: IWorldMatrixProvider | null): void;
export declare function setParent(child: SceneNode, parent: IWorldMatrixProvider | null): void;
// scene/swapchain-overlay.d.ts
import type { SceneContext } from "./scene-core.js";
export declare function configureSwapchainOverlayScene(overlay: SceneContext): void;
// scene/transform-node.d.ts
import type { SceneNode } from "./scene-node.js";
export type { SceneNode } from "./scene-node.js";
export type TransformNode = SceneNode;
export declare function createTransformNode(name: string, px?: number, py?: number, pz?: number, qx?: number, qy?: number, qz?: number, qw?: number, sx?: number, sy?: number, sz?: number): TransformNode;
export declare function cloneTransformNode(src: SceneNode): SceneNode;
// scene/visibility.d.ts
import type { SceneNode } from "./scene-node.js";
export declare function setSubtreeVisible(node: SceneNode, v: boolean): void;
// scene/world-matrix-state.d.ts
import type { Mat4, Quat, Vec3 } from "../math/types.js";
import type { IWorldMatrixProvider } from "./parentable.js";
import type { Mat4Storage } from "../math/types.js";
export interface WorldMatrixAccessors {
    getWorldMatrix(): Mat4;
    getWorldMatrixVersion(): number;
    markLocalDirty(): void;
    parent: IWorldMatrixProvider | null;
    _invalidate(): void;
    _addChild(child: WorldMatrixAccessors): void;
    _removeChild(child: WorldMatrixAccessors): void;
}
export declare function attachWorldMatrixState(host: object, state: WorldMatrixAccessors): void;
export declare function _markWorldMatrixDirty(host: IWorldMatrixProvider): void;
export declare function _markLocalMatrixDirty(host: IWorldMatrixProvider): void;
export declare function composeTrsLocalMatrix(position: Vec3, rotation: Quat, scaling: Vec3): Mat4;
export declare function composeTrsLocalMatrixIntoBuffer(local: Mat4Storage, position: Vec3, rotation: Quat, scaling: Vec3): void;
export declare function createWorldMatrixState(getLocalMatrix: () => Mat4): WorldMatrixAccessors;
```

Reply with every file you write or change, each as a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the files, tell me in a sentence or two what you did, and say if there was anything you were not sure of.
