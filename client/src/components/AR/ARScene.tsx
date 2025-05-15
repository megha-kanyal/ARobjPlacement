import { useRef, useState, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useTexture } from "@react-three/drei";
import * as THREE from "three";
import PlacementIndicator from "./PlacementIndicator";
import ARObject from "./ARObject";
import ARControls from "./ARControls";
import { useARStore } from "@/lib/stores/useARStore";
import { estimateSurfaceNormal, detectSurfaces } from "@/lib/ar-utils";
import { toast } from "sonner";

interface ARSceneProps {
  videoElement: HTMLVideoElement | null;
}

const ARScene = ({ videoElement }: ARSceneProps) => {
  const { gl, camera } = useThree();
  const { 
    placedObjects, 
    addObject, 
    selectedObjectType,
    hitTestSource,
    editMode,
    selectedObjectId
  } = useARStore();
  
  const [isReady, setIsReady] = useState(false);
  const [hitPose, setHitPose] = useState<THREE.Matrix4 | null>(null);
  
  // Reference to the scene for raycasting
  const sceneRef = useRef<THREE.Scene>(null);
  
  // Preload textures
  const woodTexture = useTexture("/ARobjPlacement/textures/wood.jpg");
  
  useEffect(() => {
    if (videoElement) {
      setIsReady(true);
      toast.success("AR scene initialized");
    }
  }, [videoElement]);

  useEffect(() => {
    // Set up touch event listeners for object placement
    const handleTouch = (event: TouchEvent) => {
      if (editMode) return; // Don't place new objects in edit mode
      
      const touch = event.touches[0];
      const x = (touch.clientX / window.innerWidth) * 2 - 1;
      const y = -(touch.clientY / window.innerHeight) * 2 + 1;
      
      if (hitPose) {
        // Create a position from the hit pose
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        
        const matrix = hitPose.clone();
        matrix.decompose(position, quaternion, scale);
        
        // Add the new object at this position
        addObject({
          id: `object-${Date.now()}`,
          type: selectedObjectType,
          position: [position.x, position.y, position.z],
          rotation: [0, 0, 0],
          scale: [1, 1, 1]
        });
        
        toast.success(`Placed ${selectedObjectType}`);
      } else {
        toast.error("No surface detected. Point at a flat surface.");
      }
    };
    
    document.addEventListener("touchstart", handleTouch);
    
    return () => {
      document.removeEventListener("touchstart", handleTouch);
    };
  }, [hitPose, selectedObjectType, addObject, editMode]);

  // Main render loop
  useFrame((state, delta) => {
    if (!isReady || !videoElement) return;
    
    // If we have WebXR hit testing available
    if (hitTestSource) {
      // WebXR hit testing will update the hitPose
      // This would be handled by the XR session
    } else {
      // Fallback method: image-based surface detection
      const surfaceInfo = detectSurfaces(videoElement);
      
      if (surfaceInfo) {
        const { position, normal } = surfaceInfo;
        
        // Create a matrix from position and normal
        const matrix = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion();
        
        // Align orientation with the surface normal
        quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          normal
        );
        
        matrix.compose(
          position,
          quaternion,
          new THREE.Vector3(1, 1, 1)
        );
        
        setHitPose(matrix);
      } else {
        setHitPose(null);
      }
    }
  });

  if (!isReady) return null;

  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.5} />
      
      {/* Directional light for shadows and highlights */}
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1} 
        castShadow 
      />
      
      {/* Surface indicator */}
      {hitPose && !editMode && <PlacementIndicator hitPose={hitPose} />}
      
      {/* Render all placed objects */}
      {placedObjects.map((object) => (
        <ARObject 
          key={object.id}
          object={object}
          woodTexture={woodTexture}
          isSelected={selectedObjectId === object.id}
        />
      ))}
      
      {/* Controls for editing objects */}
      {editMode && selectedObjectId && (
        <ARControls />
      )}
    </>
  );
};

export default ARScene;
