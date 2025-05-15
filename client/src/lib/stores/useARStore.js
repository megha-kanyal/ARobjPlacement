import { create } from "zustand";

export const useARStore = create((set, get) => ({
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