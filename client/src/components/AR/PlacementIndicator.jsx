import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PlacementIndicator = ({ hitPose }) => {
  const groupRef = useRef(null);
  const materialRef = useRef(null);
  
  // Extract position and orientation from hit pose
  useEffect(() => {
    if (groupRef.current && hitPose) {
      // Apply the hit pose matrix to position the indicator
      groupRef.current.matrix.copy(hitPose);
      groupRef.current.matrixAutoUpdate = false;
      groupRef.current.matrixWorldNeedsUpdate = true;
    }
  }, [hitPose]);
  
  // Pulse animation for the indicator
  useFrame((state, delta) => {
    if (materialRef.current) {
      // Make the indicator pulse by changing opacity
      const t = state.clock.getElapsedTime();
      materialRef.current.opacity = 0.5 + Math.sin(t * 4) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Circle indicator showing where object will be placed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.1, 0.15, 32]} />
        <meshBasicMaterial 
          ref={materialRef}
          color={0x4285F4} 
          transparent={true}
          opacity={0.7} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Crosshair in the center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.03, 0.03]} />
        <meshBasicMaterial 
          color={0xFFFFFF}
          transparent={true}
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};

export default PlacementIndicator;