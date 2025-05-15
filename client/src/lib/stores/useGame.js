import { create } from "zustand";

export const useGame = create()(
  (set) => ({
    phase: "ready",
    
    // Game control actions
    start: () => set({ phase: "playing" }),
    
    restart: () => {
      set({ phase: "ready" });
      setTimeout(() => set({ phase: "playing" }), 100);
    },
    
    end: () => set({ phase: "ended" })
  })
);