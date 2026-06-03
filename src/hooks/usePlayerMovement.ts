import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useGameStore } from '@/stores/gameStore'
import { useInputStore } from '@/stores/inputStore'

const SPEED = 5
const TURN_SPEED = 10
const KEYS = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'])

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI
  return a + diff * t
}

export function usePlayerMovement() {
  const meshRef = useRef<Group>(null)
  const held = useRef<Set<string>>(new Set())
  const isMovingRef = useRef(false)
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
    if (!meshRef.current || activeDialogue) {
      isMovingRef.current = false
      return
    }

    const keys = held.current
    const hasKeyboard = [...keys].some((k) => KEYS.has(k))

    const { joystick } = useInputStore.getState()
    const hasJoystick = Math.abs(joystick.x) > 0.02 || Math.abs(joystick.z) > 0.02

    isMovingRef.current = hasKeyboard || hasJoystick

    if (!hasKeyboard && !hasJoystick) return

    const pos  = meshRef.current.position
    const move = SPEED * delta
    let dx = 0
    let dz = 0

    if (hasKeyboard) {
      if (keys.has('w') || keys.has('arrowup'))    dz -= 1
      if (keys.has('s') || keys.has('arrowdown'))  dz += 1
      if (keys.has('a') || keys.has('arrowleft'))  dx -= 1
      if (keys.has('d') || keys.has('arrowright')) dx += 1
      const len = Math.sqrt(dx * dx + dz * dz)
      if (len > 0) { dx /= len; dz /= len }
    } else {
      dx = joystick.x
      dz = joystick.z
    }

    pos.x += dx * move
    pos.z += dz * move
    pos.y = 0

    if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
      const targetAngle = Math.atan2(dx, dz)
      meshRef.current.rotation.y = lerpAngle(
        meshRef.current.rotation.y,
        targetAngle,
        Math.min(1, TURN_SPEED * delta),
      )
    }

    setPlayerPosition([pos.x, pos.y, pos.z])
  })

  return { meshRef, isMovingRef }
}
