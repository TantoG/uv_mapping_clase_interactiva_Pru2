
export enum ShapeType {
  Cube = 'cube',
  Sphere = 'sphere',
}

export enum ProjectionType {
  Planar = 'planar',
  Box = 'box',
  Cylindrical = 'cylindrical',
  Spherical = 'spherical',
}

export enum Axis {
  X = 'x',
  Y = 'y',
  Z = 'z',
}

export interface AppState {
  shape: ShapeType;
  projection: ProjectionType;
  axis: Axis;
  autoRotate: boolean;
  blenderMode: boolean;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  tiling: number;
  repeatTexture: boolean;
}
