import { create } from "zustand";

interface VatState {
  isPaused: boolean;
  progress: number;
  setProgress: (progress: number) => void;
  togglePause: () => void;
  setPause: (val: boolean) => void;
}

export const useStore = create<VatState>((set) => ({
  isPaused: false,
  progress: 0,
  setProgress: (progress) => set({ progress }),
  setPause: (val) => set({ isPaused: val }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
}));
