import { useRef, useCallback } from 'react'
import { useInputStore } from '@/stores/inputStore'
import { useGameStore } from '@/stores/gameStore'
import { npcData } from '@/data/npcs'
import { apartmentObjects } from '@/data/apartment'
import {
  getNearestNPCInRange,
  getNearestObjectInRange,
  interactWithNearestNPC,
  interactWithNearestObject,
} from '@/systems/interactionSystem'
import styles from './MobileControls.module.css'

const THUMB_TRAVEL = 38

// ── VirtualJoystick ────────────────────────────────────────────────────────

function VirtualJoystick() {
  const baseRef    = useRef<HTMLDivElement>(null)
  const thumbRef   = useRef<HTMLDivElement>(null)
  const activeId   = useRef<number | null>(null)
  const setJoystick  = useInputStore((s) => s.setJoystick)
  const resetJoystick = useInputStore((s) => s.resetJoystick)

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const base  = baseRef.current
      const thumb = thumbRef.current
      if (!base || !thumb) return

      const rect = base.getBoundingClientRect()
      const cx   = rect.left + rect.width  / 2
      const cy   = rect.top  + rect.height / 2
      const dx   = clientX - cx
      const dy   = clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      const scale = dist > THUMB_TRAVEL ? THUMB_TRAVEL / dist : 1
      const nx = dx * scale
      const ny = dy * scale

      thumb.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`
      setJoystick(nx / THUMB_TRAVEL, ny / THUMB_TRAVEL)
    },
    [setJoystick]
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (activeId.current !== null) return
      e.currentTarget.setPointerCapture(e.pointerId)
      activeId.current = e.pointerId
      updateFromPointer(e.clientX, e.clientY)
    },
    [updateFromPointer]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (activeId.current !== e.pointerId) return
      updateFromPointer(e.clientX, e.clientY)
    },
    [updateFromPointer]
  )

  const release = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (activeId.current !== e.pointerId) return
      activeId.current = null
      if (thumbRef.current) {
        thumbRef.current.style.transform = 'translate(-50%, -50%)'
      }
      resetJoystick()
    },
    [resetJoystick]
  )

  return (
    <div
      ref={baseRef}
      className={styles.joystickBase}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <div ref={thumbRef} className={styles.joystickThumb} />
    </div>
  )
}

// ── ActionButtons ──────────────────────────────────────────────────────────

function ActionButtons() {
  const playerPosition     = useGameStore((s) => s.playerPosition)
  const activeDialogue     = useGameStore((s) => s.activeDialogue)
  const currentArea        = useGameStore((s) => s.currentArea)
  const apartmentInteracted = useGameStore((s) => s.apartmentInteracted)
  const toggleQuestLog     = useGameStore((s) => s.toggleQuestLog)

  let canInteract: boolean
  let handleInteract: () => void
  let interactLabel: string

  if (currentArea === 'apartment') {
    const visible = apartmentObjects.filter(
      (o) => o.id !== 'apartment_door' || apartmentInteracted
    )
    canInteract = getNearestObjectInRange(playerPosition, visible) !== null && activeDialogue === null
    handleInteract = () => interactWithNearestObject(playerPosition, visible)
    interactLabel = 'Inspect'
  } else {
    canInteract = getNearestNPCInRange(playerPosition, npcData) !== null && activeDialogue === null
    handleInteract = () => interactWithNearestNPC(playerPosition, npcData)
    interactLabel = 'Talk'
  }

  return (
    <div className={styles.actionArea}>
      <button
        className={`${styles.actionBtn} ${styles.questBtn}`}
        onPointerDown={toggleQuestLog}
        aria-label="Quest log"
      >
        Quests
      </button>
      <button
        className={`${styles.actionBtn} ${styles.talkBtn} ${canInteract ? styles.canTalk : styles.cantTalk}`}
        onPointerDown={canInteract ? handleInteract : undefined}
        aria-label={interactLabel}
        aria-disabled={!canInteract}
      >
        {interactLabel}
      </button>
    </div>
  )
}

// ── MobileControls ─────────────────────────────────────────────────────────
// Shown on touch/mobile devices via CSS (pointer:coarse media query).
// Hidden on desktop — keyboard controls still work regardless.

export function MobileControls() {
  return (
    <div className={styles.controls}>
      <VirtualJoystick />
      <ActionButtons />
    </div>
  )
}
