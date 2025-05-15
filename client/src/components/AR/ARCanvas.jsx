import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import ARScene from "./ARScene";
import { useARStore } from "../../lib/stores/useARStore";
import { toast } from "sonner";

const ARCanvas = () => {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const { setHitTestSource } = useARStore();

  useEffect(() => {
    // Set up the video feed
    const setupVideo = async () => {
      try {
        const video = videoRef.current;
        if (!video) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: window.innerWidth },
            height: { ideal: window.innerHeight }
          },
        });

        video.srcObject = stream;
        video.play();

        // When video is ready, mark as ready for AR overlay
        video.onloadedmetadata = () => {
          setVideoReady(true);
          toast.success("Camera feed initialized");
        };
      } catch (error) {
        console.error("Error setting up video:", error);
        toast.error("Failed to access camera");
      }
    };

    setupVideo();

    // Try to initialize WebXR for devices that support it
    const checkXRSupport = async () => {
      if ('xr' in navigator) {
        try {
          const isSupported = await navigator.xr?.isSessionSupported('immersive-ar');
          if (isSupported) {
            const session = await navigator.xr?.requestSession('immersive-ar', {
              requiredFeatures: ['hit-test'],
            });
            
            if (session) {
              // Set up hit test source for detecting surfaces
              const hitTestSourceInitialized = (source) => {
                setHitTestSource(source);
                toast.success("AR surface detection active");
              };
              
              session.requestReferenceSpace('viewer').then((viewerSpace) => {
                session.requestHitTestSource({ space: viewerSpace })
                  .then(hitTestSourceInitialized);
              });
            }
          } else {
            console.log("WebXR AR not supported on this device, falling back to image processing");
          }
        } catch (error) {
          console.log("WebXR initialization error, using fallback:", error);
        }
      } else {
        console.log("WebXR not available, using camera-based fallback");
      }
    };

    checkXRSupport();

    return () => {
      // Clean up video stream when component unmounts
      const video = videoRef.current;
      if (video && video.srcObject) {
        const stream = video.srcObject;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      {/* Camera video feed (background) */}
      <video
        ref={videoRef}
        id="camera-feed"
        playsInline
        muted
        className="absolute top-0 left-0 min-w-full min-h-full object-cover z-0"
      />

      {/* Three.js Canvas overlay */}
      {videoReady && (
        <Canvas
          className="absolute top-0 left-0 z-10 pointer-events-auto"
          camera={{ 
            position: [0, 1.5, 3], 
            fov: 75,
            near: 0.1,
            far: 1000
          }}
          gl={{
            alpha: true,
            antialias: true,
            preserveDrawingBuffer: true,
          }}
        >
          <Suspense fallback={null}>
            <ARScene videoElement={videoRef.current} />
          </Suspense>
        </Canvas>
      )}
    </>
  );
};

export default ARCanvas;