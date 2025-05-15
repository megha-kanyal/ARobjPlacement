import * as THREE from "three";

// Function to detect surfaces from camera image
export function detectSurfaces(videoElement: HTMLVideoElement) {
  // In a real implementation, this would use image processing
  // to detect flat surfaces in the camera feed
  // This is a simplified mock implementation
  
  // We're mocking a flat surface at a fixed distance
  const mockDetection = {
    // Position slightly in front of the camera
    position: new THREE.Vector3(0, 0, -2),
    // Normal pointing up (assuming flat surface)
    normal: new THREE.Vector3(0, 1, 0)
  };
  
  return mockDetection;
}

// Function to estimate surface normal from multiple hit points
export function estimateSurfaceNormal(points: THREE.Vector3[]): THREE.Vector3 {
  if (points.length < 3) {
    // Default to upward normal if we don't have enough points
    return new THREE.Vector3(0, 1, 0);
  }
  
  // Take three points to form a plane
  const a = points[0];
  const b = points[1];
  const c = points[2];
  
  // Calculate two vectors in the plane
  const ab = new THREE.Vector3().subVectors(b, a);
  const ac = new THREE.Vector3().subVectors(c, a);
  
  // Calculate the cross product to get the normal
  const normal = new THREE.Vector3().crossVectors(ab, ac).normalize();
  
  return normal;
}

// Function to convert screen coordinates to world ray
export function screenToRay(
  x: number,
  y: number,
  camera: THREE.Camera
): THREE.Ray {
  // Convert screen coordinates to normalized device coordinates
  const ndcX = (x / window.innerWidth) * 2 - 1;
  const ndcY = -(y / window.innerHeight) * 2 + 1;
  
  // Create vector and unproject
  const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
  vector.unproject(camera);
  
  // Create ray from camera position and direction
  const origin = camera.position.clone();
  const direction = vector.sub(origin).normalize();
  
  return new THREE.Ray(origin, direction);
}

// Function to project a hit point onto a detected plane
export function projectOntoPlane(
  ray: THREE.Ray,
  planeOrigin: THREE.Vector3,
  planeNormal: THREE.Vector3
): THREE.Vector3 | null {
  // Calculate the denominator for the intersection test
  const denominator = planeNormal.dot(ray.direction);
  
  // If ray is parallel to the plane, no intersection
  if (Math.abs(denominator) < 0.0001) {
    return null;
  }
  
  // Calculate distance to intersection
  const t = planeNormal.dot(
    new THREE.Vector3().subVectors(planeOrigin, ray.origin)
  ) / denominator;
  
  // If intersection is behind the ray origin, no intersection
  if (t < 0) {
    return null;
  }
  
  // Calculate intersection point
  return ray.at(t, new THREE.Vector3());
}
