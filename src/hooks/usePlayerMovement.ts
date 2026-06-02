import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useGameStore } from '@/stores/gameStore'
import { useInputStore } from '@/stores/inputStore'

const SPEED = 5
const KEYS = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'])

// ── usePlayerMovement ──────────────────────────────────────────────────────
// Merges keyboard input and joystick input into player movement each frame.
// Keyboard takes priority; joystick is used when no keyboard keys are held.
// Movement is disabled while a dialogue is active.
// Returns a ref to attach to the player Group.

export function usePlayerMovement() {
  const meshRef = useRef<Group>(null)
  const held = useRef<Set<string>>(new Set())
  const activeDialogue = useGameStore((s) => s.activeDialogue)
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition)

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => held.current.add(e.key.toLowerCase())
    const onUp   = (e: KeyboardEvent) => held.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup',   onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup',   onUp)
    }
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current || activeDialogue) return

    const keys = held.current
    const hasKeyboard = [...keys].some((k) => KEYS.has(k))

    // Read joystick without subscribing (polling is fine at frame rate)
    const { joystick } = useInputStore.getState()
    const hasJoystick =
      Math.abs(joystick.x) > 0.02 || Math.abs(joystick.z) > 0.02

    if (!hasKeyboard && !hasJoystick) return

    const pos  = meshRef.current.position
    const move = SPEED * delta

    if (hasKeyboard) {
      if (keys.has('w') || keys.has('arrowup'))    pos.z -= move
      if (keys.has('s') || keys.has('arrowdown'))  pos.z += move
      if (keys.has('a') || keys.has('arrowleft'))  pos.x -= move
      if (keys.has('d') || keys.has('arrowright')) pos.x += move
    } else if (hasJoystick) {
      pos.x += joystick.x * move
      pos.z += joystick.z * move
    }

    pos.y = 0
    setPlayerPosition([pos.x, pos.y, pos.z])
  })

  return meshRef
}
