import { create } from 'zustand'

interface InputState {
  // Normalised joystick direction: x in [-1,1], z in [-1,1].
  // z positive = south (world +Z), z negative = north (world -Z).
  joystick: { x: number; z: number }
  setJoystick: (x: number, z: number) => void
  resetJoystick: () => void
}

export const useInputStore = create<InputState>((set) => ({
  joystick: { x: 0, z: 0 },
  setJoystick: (x, z) => set({ joystick: { x, z } }),
  resetJoystick: () => set({ joystick: { x: 0, z: 0 } }),
}))
