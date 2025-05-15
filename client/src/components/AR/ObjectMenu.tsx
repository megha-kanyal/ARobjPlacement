import React from "react";
import { useARStore } from "@/lib/stores/useARStore";
import { Button } from "@/components/ui/button";
import { 
  Box, 
  Sofa, 
  Table, 
  Circle, 
  Triangle, 
  Trash2
} from "lucide-react";
import { toast } from "sonner";

const ObjectMenu = () => {
  const { 
    selectedObjectType, 
    setSelectedObjectType, 
    removeSelectedObject,
    selectedObjectId,
    placedObjects,
    clearObjects,
    editMode
  } = useARStore();

  const objectTypes = [
    { type: "cube", icon: <Box />, label: "Box" },
    { type: "sphere", icon: <Circle />, label: "Sphere" },
    { type: "cylinder", icon: <Table />, label: "Cylinder" },
    { type: "cone", icon: <Triangle />, label: "Cone" },
    { type: "chair", icon: <Sofa />, label: "Chair" },
  ];

  const handleObjectSelect = (type: string) => {
    setSelectedObjectType(type);
    toast.info(`Selected ${type}`);
  };

  const handleClearObjects = () => {
    clearObjects();
    toast.success("All objects removed");
  };

  const handleDeleteSelected = () => {
    if (selectedObjectId) {
      removeSelectedObject();
      toast.success("Object removed");
    } else {
      toast.error("No object selected");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Object deletion controls - only visible in edit mode */}
      {editMode && placedObjects.length > 0 && (
        <div className="flex justify-between gap-2">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleDeleteSelected}
            disabled={!selectedObjectId}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
          
          {placedObjects.length > 1 && (
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleClearObjects}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      )}
      
      {/* Object selection - only visible when not in edit mode */}
      {!editMode && (
        <div className="flex overflow-x-auto pb-2 gap-2">
          {objectTypes.map((object) => (
            <Button
              key={object.type}
              variant={selectedObjectType === object.type ? "default" : "outline"}
              className={`flex-shrink-0 ${
                selectedObjectType === object.type 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-black/50 text-white border-white/30"
              } backdrop-blur-sm`}
              onClick={() => handleObjectSelect(object.type)}
            >
              <span className="mr-2">{object.icon}</span>
              {object.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ObjectMenu;
