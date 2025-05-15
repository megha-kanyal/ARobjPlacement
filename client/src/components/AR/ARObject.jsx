import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useARStore } from "../../lib/stores/useARStore";

const ARObject = ({ object, woodTexture, isSelected }) => {
  const { setSelectedObjectId, editMode, updateObjectTransform } = useARStore();
  const meshRef = useRef(null);
  
  // Apply the texture properly
  const textureMaterial = React.useMemo(() => {
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(1, 1);
    
    return new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.7,
      metalness: 0.1
    });
  }, [woodTexture]);
  
  // Material for the selection outline
  const outlineMaterial = React.useMemo(() => 
    new THREE.MeshBasicMaterial({
      color: 0x4285F4,
      wireframe: true,
      transparent: true,
      opacity: 0.8
    })
  , []);
  
  // Handle selection
  const handleClick = (e) => {
    e.stopPropagation();
    if (editMode) {
      setSelectedObjectId(object.id);
    }
  };
  
  // Update the mesh with latest transform values
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.set(...object.position);
      meshRef.current.rotation.set(...object.rotation);
      meshRef.current.scale.set(...object.scale);
    }
  }, [object]);
  
  // Highlight effect for selected objects
  useFrame((state, delta) => {
    if (isSelected && meshRef.current) {
      // Make selected object subtly pulse
      const t = state.clock.getElapsedTime();
      const pulse = 1 + Math.sin(t * 3) * 0.05;
      meshRef.current.scale.set(
        object.scale[0] * pulse,
        object.scale[1] * pulse,
        object.scale[2] * pulse
      );
    }
  });
  
  // Render the appropriate geometry based on type
  const renderGeometry = () => {
    switch (object.type) {
      case "cube":
        return <boxGeometry args={[1, 1, 1]} />;
      case "sphere":
        return <sphereGeometry args={[0.5, 32, 32]} />;
      case "cylinder":
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case "cone":
        return <coneGeometry args={[0.5, 1, 32]} />;
      case "chair":
        // A simple chair made of cubes
        return (
          <group>
            {/* Seat */}
            <mesh position={[0, 0.4, 0]} scale={[1, 0.1, 1]}>
              <boxGeometry />
              <meshStandardMaterial map={woodTexture} />
            </mesh>
            
            {/* Backrest */}
            <mesh position={[0, 0.9, -0.45]} scale={[1, 1, 0.1]}>
              <boxGeometry />
              <meshStandardMaterial map={woodTexture} />
            </mesh>
            
            {/* Legs */}
            <mesh position={[0.4, 0, 0.4]} scale={[0.1, 0.8, 0.1]}>
              <boxGeometry />
              <meshStandardMaterial map={woodTexture} />
            </mesh>
            <mesh position={[-0.4, 0, 0.4]} scale={[0.1, 0.8, 0.1]}>
              <boxGeometry />
              <meshStandardMaterial map={woodTexture} />
            </mesh>
            <mesh position={[0.4, 0, -0.4]} scale={[0.1, 0.8, 0.1]}>
              <boxGeometry />
              <meshStandardMaterial map={woodTexture} />
            </mesh>
            <mesh position={[-0.4, 0, -0.4]} scale={[0.1, 0.8, 0.1]}>
              <boxGeometry />
              <meshStandardMaterial map={woodTexture} />
            </mesh>
          </group>
        );
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };
  
  // For simple objects, render a basic mesh
  if (object.type !== "chair") {
    return (
      <group>
        {/* Main object */}
        <mesh
          ref={meshRef}
          position={object.position}
          rotation={object.rotation}
          scale={object.scale}
          onClick={handleClick}
          castShadow
          receiveShadow
        >
          {renderGeometry()}
          <meshStandardMaterial 
            map={woodTexture}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        
        {/* Selection outline - only shown when selected */}
        {isSelected && (
          <mesh
            position={object.position}
            rotation={object.rotation}
            scale={[
              object.scale[0] * 1.05,
              object.scale[1] * 1.05,
              object.scale[2] * 1.05
            ]}
          >
            {renderGeometry()}
            {outlineMaterial}
          </mesh>
        )}
      </group>
    );
  }
  
  // For the chair, return the group directly
  return (
    <group
      ref={meshRef}
      position={object.position}
      rotation={object.rotation}
      scale={object.scale}
      onClick={handleClick}
    >
      {renderGeometry()}
      
      {/* Selection outline for the chair */}
      {isSelected && (
        <mesh scale={[1.05, 1.05, 1.05]}>
          <boxGeometry />
          {outlineMaterial}
        </mesh>
      )}
    </group>
  );
};

export default ARObject;