import { create } from "zustand";

// Define types for AR objects
export type ARObjectType = "cube" | "sphere" | "cylinder" | "cone" | "chair";

export interface ARObject {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

// Optional transform updates
interface TransformUpdate {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

// AR store state interface
interface ARState {
  // Object State
  placedObjects: ARObject[];
  selectedObjectId: string | null;
  selectedObjectType: ARObjectType;
  
  // AR State
  hitTestSource: any; // WebXR hit test source
  editMode: boolean;
  
  // Actions
  setSelectedObjectType: (type: ARObjectType) => void;
  addObject: (object: ARObject) => void;
  removeObject: (id: string) => void;
  removeSelectedObject: () => void;
  clearObjects: () => void;
  setSelectedObjectId: (id: string | null) => void;
  updateObjectTransform: (id: string, update: TransformUpdate) => void;
  
  // AR Setup
  setHitTestSource: (source: any) => void;
  setEditMode: (mode: boolean) => void;
}

export const useARStore = create<ARState>((set, get) => ({
  // Initial state
  placedObjects: [],
  selectedObjectId: null,
  selectedObjectType: "cube",
  hitTestSource: null,
  editMode: false,
  
  // Object type selection
  setSelectedObjectType: (type) => set({ selectedObjectType: type }),
  
  // Object CRUD operations
  addObject: (object) => {
    set((state) => ({
      placedObjects: [...state.placedObjects, object]
    }));
  },
  
  removeObject: (id) => {
    set((state) => ({
      placedObjects: state.placedObjects.filter(obj => obj.id !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId
    }));
  },
  
  removeSelectedObject: () => {
    const { selectedObjectId } = get();
    if (selectedObjectId) {
      set((state) => ({
        placedObjects: state.placedObjects.filter(obj => obj.id !== selectedObjectId),
        selectedObjectId: null
      }));
    }
  },
  
  clearObjects: () => {
    set({
      placedObjects: [],
      selectedObjectId: null
    });
  },
  
  setSelectedObjectId: (id) => {
    set({ selectedObjectId: id });
  },
  
  updateObjectTransform: (id, update) => {
    set((state) => ({
      placedObjects: state.placedObjects.map(obj => 
        obj.id === id
          ? {
              ...obj,
              position: update.position || obj.position,
              rotation: update.rotation || obj.rotation,
              scale: update.scale || obj.scale
            }
          : obj
      )
    }));
  },
  
  // AR setup
  setHitTestSource: (source) => {
    set({ hitTestSource: source });
  },
  
  setEditMode: (mode) => {
    set({ 
      editMode: mode,
      // Clear selection when leaving edit mode
      selectedObjectId: mode ? get().selectedObjectId : null
    });
  }
}));
