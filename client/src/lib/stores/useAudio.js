import { create } from "zustand";

export const useAudio = create((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: false,
  
  // Setter functions
  setBackgroundMusic: (music) => {
    set({ backgroundMusic: music });
    
    const { isMuted } = get();
    if (!isMuted && music) {
      music.volume = 0.3;
      music.loop = true;
      music.play().catch(err => console.error("Audio play failed:", err));
    }
  },
  
  setHitSound: (sound) => {
    set({ hitSound: sound });
  },
  
  setSuccessSound: (sound) => {
    set({ successSound: sound });
  },
  
  // Control functions
  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    set({ isMuted: newMutedState });
    
    if (backgroundMusic) {
      if (newMutedState) {
        backgroundMusic.pause();
      } else {
        backgroundMusic.play().catch(err => console.error("Audio play failed:", err));
      }
    }
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound && !isMuted) {
      hitSound.currentTime = 0;
      hitSound.play().catch(err => console.error("Audio play failed:", err));
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound && !isMuted) {
      successSound.currentTime = 0;
      successSound.play().catch(err => console.error("Audio play failed:", err));
    }
  }
}));