import { useRef, useCallback } from 'react'
import { useInputStore } from '@/stores/inputStore'
import { useGameStore } from '@/stores/gameStore'
import { npcData } from '@/data/npcs'
import {
  getNearestNPCInRange,
  interactWithNearestNPC,
} from '@/systems/interactionSystem'
import styles from './MobileControls.module.css'

// Max pixel travel of the joystick thumb from the base centre.
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
  const playerPosition = useGameStore((s) => s.playerPosition)
  const activeDialogue = useGameStore((s) => s.activeDialogue)
  const toggleQuestLog = useGameStore((s) => s.toggleQuestLog)

  const nearestNPC = getNearestNPCInRange(playerPosition, npcData)
  const canTalk    = nearestNPC !== null && activeDialogue === null

  function handleTalk() {
    interactWithNearestNPC(playerPosition, npcData)
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
        className={`${styles.actionBtn} ${styles.talkBtn} ${canTalk ? styles.canTalk : styles.cantTalk}`}
        onPointerDown={canTalk ? handleTalk : undefined}
        aria-label="Talk to NPC"
        aria-disabled={!canTalk}
      >
        Talk
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
