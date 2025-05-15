import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useARStore } from "@/lib/stores/useARStore";

const ARControls = () => {
  const { camera, gl, scene } = useThree();
  const { 
    selectedObjectId,
    placedObjects,
    updateObjectTransform
  } = useARStore();
  
  // References for tracking touch interaction
  const startPosRef = useRef<{ x: number, y: number } | null>(null);
  const currentPosRef = useRef<{ x: number, y: number } | null>(null);
  const multiTouchStartRef = useRef<{ dist: number, scale: number } | null>(null);
  const isDraggingRef = useRef(false);
  const touchCountRef = useRef(0);
  
  // Get the currently selected object
  const selectedObject = placedObjects.find((obj) => obj.id === selectedObjectId);

  useEffect(() => {
    if (!selectedObject) return;
    
    // Touch start handler
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      
      // Update touch count
      touchCountRef.current = e.touches.length;
      
      if (e.touches.length === 1) {
        // Single touch - prepare for rotation or movement
        startPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
        currentPosRef.current = { ...startPosRef.current };
        isDraggingRef.current = true;
      }
      else if (e.touches.length === 2) {
        // Two touches - prepare for scaling
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // Calculate the distance between touches
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        multiTouchStartRef.current = {
          dist: distance,
          scale: selectedObject.scale[0] // Assuming uniform scaling
        };
      }
    };
    
    // Touch move handler
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      if (!isDraggingRef.current) return;
      
      if (e.touches.length === 1 && startPosRef.current && currentPosRef.current) {
        // Single touch - handle rotation or movement
        currentPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
        
        // Calculate deltas
        const deltaX = currentPosRef.current.x - startPosRef.current.x;
        const deltaY = currentPosRef.current.y - startPosRef.current.y;
        
        if (e.shiftKey) {
          // Shift key pressed - rotate the object
          const rotationSpeed = 0.01;
          updateObjectTransform(selectedObjectId, {
            rotation: [
              selectedObject.rotation[0],
              selectedObject.rotation[1] + deltaX * rotationSpeed,
              selectedObject.rotation[2] + deltaY * rotationSpeed
            ]
          });
        } else {
          // Move the object in the camera plane
          moveObjectWithCamera(deltaX, deltaY);
        }
        
        // Update start position for next move
        startPosRef.current = { ...currentPosRef.current };
      }
      else if (e.touches.length === 2 && multiTouchStartRef.current) {
        // Two touches - handle scaling
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // Calculate the current distance between touches
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        const currentDist = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate scale factor
        const scaleFactor = currentDist / multiTouchStartRef.current.dist;
        const newScale = multiTouchStartRef.current.scale * scaleFactor;
        
        // Apply new scale (with limits)
        const clampedScale = Math.max(0.2, Math.min(3.0, newScale));
        updateObjectTransform(selectedObjectId, {
          scale: [clampedScale, clampedScale, clampedScale]
        });
      }
    };
    
    // Touch end handler
    const handleTouchEnd = (e: TouchEvent) => {
      touchCountRef.current = e.touches.length;
      
      if (e.touches.length === 0) {
        isDraggingRef.current = false;
        startPosRef.current = null;
        currentPosRef.current = null;
        multiTouchStartRef.current = null;
      }
      else if (e.touches.length === 1) {
        // Switched from multi-touch to single-touch
        multiTouchStartRef.current = null;
        startPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
        currentPosRef.current = { ...startPosRef.current };
      }
    };
    
    // Helper function to move object according to camera orientation
    const moveObjectWithCamera = (deltaX: number, deltaY: number) => {
      if (!selectedObject) return;
      
      // Movement sensitivity
      const moveSensitivity = 0.01;
      
      // Create vectors for the camera's right and up directions
      const cameraRight = new THREE.Vector3();
      const cameraUp = new THREE.Vector3();
      camera.matrixWorld.extractBasis(cameraRight, cameraUp, new THREE.Vector3());
      
      // Scale the right and up vectors by the delta movements
      const moveRight = cameraRight.multiplyScalar(deltaX * moveSensitivity);
      const moveUp = cameraUp.multiplyScalar(-deltaY * moveSensitivity);
      
      // Combine the movements
      const moveVector = new THREE.Vector3()
        .add(moveRight)
        .add(moveUp);
      
      // Update the object position
      updateObjectTransform(selectedObjectId, {
        position: [
          selectedObject.position[0] + moveVector.x,
          selectedObject.position[1] + moveVector.y,
          selectedObject.position[2] + moveVector.z
        ]
      });
    };
    
    // Add event listeners to the canvas
    const canvas = gl.domElement;
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);
    
    return () => {
      // Remove event listeners on cleanup
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [selectedObject, selectedObjectId, updateObjectTransform, camera, gl]);
  
  // This component doesn't render anything visible
  return null;
};

export default ARControls;
