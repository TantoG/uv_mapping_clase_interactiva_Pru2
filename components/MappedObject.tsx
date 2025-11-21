
import React, { useLayoutEffect, useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { ShapeType, ProjectionType, Axis } from '../types';
import { generateUVGridTexture } from '../utils/textureGen';

interface MappedObjectProps {
  shape: ShapeType;
  projection: ProjectionType;
  axis: Axis;
  blenderMode: boolean;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  tiling: number;
  repeatTexture: boolean;
}

const MappedObject: React.FC<MappedObjectProps> = ({ 
  shape, 
  projection, 
  axis, 
  blenderMode,
  offsetX,
  offsetY,
  offsetZ,
  tiling,
  repeatTexture
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Generate texture URL once
  const textureUrl = useMemo(() => generateUVGridTexture(), []);
  const texture = useTexture(textureUrl);
  
  // Configure texture wrapping and tiling
  useLayoutEffect(() => {
    // Always use RepeatWrapping in Three.js so UVs > 1 don't get clamped by the sampler
    // We will handle the "visual" clamping (green chroma) in the shader.
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.repeat.set(tiling, tiling);
  }, [texture, tiling]);

  // Update shader uniform when repeatTexture changes
  useLayoutEffect(() => {
    if (materialRef.current?.userData?.shader) {
      materialRef.current.userData.shader.uniforms.uRepeat.value = repeatTexture ? 1.0 : 0.0;
      // Force material update if necessary, though uniform update should be immediate
      materialRef.current.needsUpdate = true;
    }
  }, [repeatTexture]);

  // Geometry creation
  const geometry = useMemo(() => {
    let geo: THREE.BufferGeometry;
    if (shape === ShapeType.Cube) {
      // High segment count for cube to allow vertex-based projection visualization
      geo = new THREE.BoxGeometry(2, 2, 2, 32, 32, 32);
    } else {
      geo = new THREE.SphereGeometry(1.2, 64, 64);
    }
    return geo;
  }, [shape]);

  // The heavy lifting: Manual UV Projection Logic
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    
    const posAttribute = geometry.attributes.position;
    const uvAttribute = geometry.attributes.uv;
    const count = posAttribute.count;

    const p = new THREE.Vector3();

    // Determine effective axis for calculation based on Blender Mode
    let calcAxis = axis;
    if (blenderMode) {
      if (axis === Axis.Z) calcAxis = Axis.Y; // User Z (Up) -> Geom Y (Up)
      else if (axis === Axis.Y) calcAxis = Axis.Z; // User Y (Depth) -> Geom Z (Depth)
      // Axis X is X in both
    }

    // Determine offsets for Geometry
    const effectiveX = offsetX;
    const effectiveY = blenderMode ? offsetZ : offsetY;
    const effectiveZ = blenderMode ? offsetY : offsetZ;

    for (let i = 0; i < count; i++) {
      p.fromBufferAttribute(posAttribute, i);
      
      // Apply user offsets to the point before projection
      p.x += effectiveX;
      p.y += effectiveY;
      p.z += effectiveZ;

      let u = 0;
      let v = 0;

      // Normalize position roughly to -1 to 1 range for calculations
      const n = p.clone().normalize(); 

      switch (projection) {
        case ProjectionType.Planar:
          if (calcAxis === Axis.Z) {
            u = (p.x + 1.5) / 3; 
            v = (p.y + 1.5) / 3;
          } else if (calcAxis === Axis.X) {
            u = (p.z + 1.5) / 3;
            v = (p.y + 1.5) / 3;
          } else if (calcAxis === Axis.Y) {
            u = (p.x + 1.5) / 3;
            v = (p.z + 1.5) / 3;
          }
          break;

        case ProjectionType.Spherical:
          let sp = p.clone().normalize();
          if (calcAxis === Axis.X) sp.set(sp.y, sp.x, sp.z);
          if (calcAxis === Axis.Z) sp.set(sp.x, sp.z, sp.y);

          u = 0.5 + Math.atan2(sp.z, sp.x) / (2 * Math.PI);
          v = 0.5 + Math.asin(sp.y) / Math.PI;
          break;

        case ProjectionType.Cylindrical:
          let angle = 0;
          let height = 0;

          if (calcAxis === Axis.Y) {
            angle = Math.atan2(p.x, p.z);
            height = p.y;
          } else if (calcAxis === Axis.X) {
             angle = Math.atan2(p.z, p.y);
             height = p.x;
          } else if (calcAxis === Axis.Z) {
             angle = Math.atan2(p.x, p.y);
             height = p.z;
          }

          u = (angle + Math.PI) / (2 * Math.PI);
          v = (height + 1.5) / 3;
          break;

        case ProjectionType.Box:
          const absX = Math.abs(n.x);
          const absY = Math.abs(n.y);
          const absZ = Math.abs(n.z);
          
          let max = Math.max(absX, absY, absZ);

          if (absX === max) {
             u = (p.z + 1.5) / 3;
             v = (p.y + 1.5) / 3;
             if (n.x > 0) u = 1 - u; 
          } else if (absY === max) {
             u = (p.x + 1.5) / 3;
             v = (p.z + 1.5) / 3;
             if (n.y < 0) v = 1 - v; 
          } else {
             u = (p.x + 1.5) / 3;
             v = (p.y + 1.5) / 3;
             if (n.z < 0) u = 1 - u; 
          }
          break;
      }

      uvAttribute.setXY(i, u, v);
    }

    uvAttribute.needsUpdate = true;

  }, [geometry, projection, axis, shape, blenderMode, offsetX, offsetY, offsetZ]);

  const handleBeforeCompile = (shader: THREE.Shader) => {
    // Inject uniform for repeat toggle
    shader.uniforms.uRepeat = { value: repeatTexture ? 1.0 : 0.0 };
    
    // Declare uniform in fragment shader
    shader.fragmentShader = `
      uniform float uRepeat;
      ${shader.fragmentShader}
    `;

    // Replace map fragment logic to inject Chroma Key logic
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `
      #ifdef USE_MAP
        // vMapUv contains the transformed UV coordinates (including tiling)
        vec2 uv = vMapUv;
        
        // Check if UV is outside the [0,1] range
        bool outOfBounds = (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0);
        
        if (uRepeat < 0.5 && outOfBounds) {
           // Chroma Key Green for out of bounds when repeat is OFF
           diffuseColor = vec4(0.0, 1.0, 0.0, 1.0);
        } else {
           // Standard texture sampling
           vec4 texelColor = texture2D( map, vMapUv );
           diffuseColor *= texelColor;
        }
      #endif
      `
    );
    
    // Save shader reference to allow updating uniforms without recompilation
    if (materialRef.current) {
       materialRef.current.userData.shader = shader;
    }
  };

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial 
        ref={materialRef}
        map={texture} 
        roughness={0.3}
        metalness={0.1}
        side={THREE.DoubleSide}
        onBeforeCompile={handleBeforeCompile}
        // Use a key to force re-compile only if major shader definition changes would be needed, 
        // but here we handle prop updates via uniform.
      />
    </mesh>
  );
};

export default MappedObject;
