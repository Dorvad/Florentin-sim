import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useGameStore } from '@/stores/gameStore'
import { useInputStore } from '@/stores/inputStore'
import { resolveCollisions, resolveApartmentCollisions } from '@/systems/collisionSystem'

const SPEED      = 5
const TURN_SPEED = 10
const GRAVITY    = -22   // m/s²
const JUMP_VY    = 6.5   // m/s initial upward velocity
const GROUND_Y   = 0

const KEYS = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'])

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI
  return a + diff * t
}

export function usePlayerMovement() {
  const meshRef       = useRef<Group>(null)
  const held          = useRef<Set<string>>(new Set())
  const isMovingRef   = useRef(false)
  const vyRef         = useRef(0)
  const groundedRef   = useRef(true)

  const activeDialogue  = useGameStore((s) => s.activeDialogue)
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition)
  const currentArea     = useGameStore((s) => s.currentArea)

  // Reset position and vertical state on area transition
  useEffect(() => {
    if (!meshRef.current) return
    meshRef.current.position.set(0, 0, 0)
    vyRef.current  = 0
    groundedRef.current = true
  }, [currentArea])

  // WASD / arrow keys
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

  // Jump on Space — fires once per keydown, blocked during dialogue
  useEffect(() => {
    const onJump = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      if (useGameStore.getState().activeDialogue) return
      if (!groundedRef.current) return
      vyRef.current     = JUMP_VY
      groundedRef.current = false
    }
    window.addEventListener('keydown', onJump)
    return () => window.removeEventListener('keydown', onJump)
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const pos = meshRef.current.position

    // ── Vertical physics — always runs so player lands even during dialogue ──
    if (!groundedRef.current || pos.y > GROUND_Y) {
      vyRef.current += GRAVITY * delta
      pos.y          += vyRef.current * delta
      if (pos.y <= GROUND_Y) {
        pos.y           = GROUND_Y
        vyRef.current   = 0
        groundedRef.current = true
      }
    }

    // ── Horizontal movement — blocked during dialogue ─────────────────────
    if (activeDialogue) {
      isMovingRef.current = false
      setPlayerPosition([pos.x, pos.y, pos.z])
      return
    }

    const keys       = held.current
    const hasKeyboard = [...keys].some((k) => KEYS.has(k))
    const { joystick } = useInputStore.getState()
    const hasJoystick  = Math.abs(joystick.x) > 0.02 || Math.abs(joystick.z) > 0.02

    isMovingRef.current = hasKeyboard || hasJoystick

    let dx = 0
    let dz = 0

    if (hasKeyboard) {
      if (keys.has('w') || keys.has('arrowup'))    dz -= 1
      if (keys.has('s') || keys.has('arrowdown'))  dz += 1
      if (keys.has('a') || keys.has('arrowleft'))  dx -= 1
      if (keys.has('d') || keys.has('arrowright')) dx += 1
      const len = Math.sqrt(dx * dx + dz * dz)
      if (len > 0) { dx /= len; dz /= len }
    } else if (hasJoystick) {
      dx = joystick.x
      dz = joystick.z
    }

    if (dx !== 0 || dz !== 0) {
      const move = SPEED * delta
      pos.x += dx * move
      pos.z += dz * move
    }

    const area = useGameStore.getState().currentArea
    if (area === 'street') {
      ;[pos.x, pos.z] = resolveCollisions(pos.x, pos.z)
    } else if (area === 'apartment') {
      ;[pos.x, pos.z] = resolveApartmentCollisions(pos.x, pos.z)
    }

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
