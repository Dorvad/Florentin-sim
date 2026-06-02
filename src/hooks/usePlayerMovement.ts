import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useGameStore } from '@/stores/gameStore'

const SPEED = 5
const KEYS = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'])

// ── usePlayerMovement ──────────────────────────────────────────────────────
// Attaches keyboard listeners and moves the player mesh ref each frame.
// Movement is disabled while a dialogue is active.
// Returns a ref to attach to the player Group/Mesh.

export function usePlayerMovement() {
  const meshRef = useRef<Group>(null)
  const held = useRef<Set<string>>(new Set())
  const activeDialogue = useGameStore((s) => s.activeDialogue)
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition)

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => held.current.add(e.key.toLowerCase())
    const onUp = (e: KeyboardEvent) => held.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current || activeDialogue) return

    const keys = held.current
    const hasInput = [...keys].some((k) => KEYS.has(k))
    if (!hasInput) return

    const pos = meshRef.current.position
    const move = SPEED * delta

    if (keys.has('w') || keys.has('arrowup'))    pos.z -= move
    if (keys.has('s') || keys.has('arrowdown'))  pos.z += move
    if (keys.has('a') || keys.has('arrowleft'))  pos.x -= move
    if (keys.has('d') || keys.has('arrowright')) pos.x += move

    // Keep player on the ground plane
    pos.y = 0

    // Sync position to store (throttled via RAF — fine for game use)
    setPlayerPosition([pos.x, pos.y, pos.z])
  })

  return meshRef
}
