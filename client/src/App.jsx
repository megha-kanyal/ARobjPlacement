import { Suspense, useEffect, useState } from "react";
import ARCanvas from "./components/AR/ARCanvas";
import ObjectMenu from "./components/AR/ObjectMenu";
import { useARStore } from "./lib/stores/useARStore";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { Camera, Box, Wand2, Settings, X } from "lucide-react";
import "@fontsource/inter";

function App() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { selectedObjectType, setEditMode, editMode } = useARStore();

  // Request camera permission when the app loads
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setPermissionGranted(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
        setPermissionGranted(false);
      }
    };

    requestCameraPermission();
  }, []);

  if (!permissionGranted) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-4 bg-background text-foreground">
        <Camera className="w-16 h-16 mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-2">Camera Access Required</h1>
        <p className="text-center mb-6">
          This AR experience needs access to your camera to work. Please allow camera access and reload the page.
        </p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden">
      {/* AR Canvas */}
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading AR...</div>}>
        <ARCanvas />
      </Suspense>

      {/* Floating UI elements */}
      <div className="absolute top-0 left-0 w-full">
        {/* Instructions Modal */}
        {showInstructions && (
          <div className="m-4 p-4 bg-black/70 rounded-lg text-white">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">AR Object Placement</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowInstructions(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Point your camera at a flat surface</li>
              <li>Tap on the surface to place an object</li>
              <li>Select different objects from the menu</li>
              <li>Use the edit button to move, rotate, or scale placed objects</li>
            </ul>
          </div>
        )}
      </div>

      {/* Bottom Menu */}
      <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col gap-4">
        <ObjectMenu />
        
        <div className="flex justify-between items-center">
          <Button 
            variant={editMode ? "default" : "outline"} 
            className={`${editMode ? 'bg-primary text-primary-foreground' : 'bg-black/50 text-white border-white/30'} backdrop-blur-sm`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Editing Mode
              </>
            ) : (
              <>
                <Settings className="mr-2 h-4 w-4" />
                Edit Objects
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            className="bg-black/50 text-white border-white/30 backdrop-blur-sm"
            onClick={() => setShowInstructions(true)}
          >
            Help
          </Button>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster position="top-center" />
    </div>
  );
}

export default App;