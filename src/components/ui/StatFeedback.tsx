import { useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import type { StatKey } from '@/types'
import styles from './StatFeedback.module.css'

const STAT_LABELS: Record<StatKey, string> = {
  energy: 'Energy',
  money: 'Money',
  socialBattery: 'Social',
  vibe: 'Vibe',
}

// ── StatFeedback ───────────────────────────────────────────────────────────
// Shows a temporary toast for each stat change after a dialogue choice.
// Auto-dismisses after 3 seconds.

export function StatFeedback() {
  const statFeedback    = useGameStore((s) => s.statFeedback)
  const clearStatFeedback = useGameStore((s) => s.clearStatFeedback)

  useEffect(() => {
    if (statFeedback.length === 0) return
    const timer = setTimeout(clearStatFeedback, 3000)
    return () => clearTimeout(timer)
  }, [statFeedback, clearStatFeedback])

  if (statFeedback.length === 0) return null

  return (
    <div className={styles.container}>
      {statFeedback.map((delta, i) => (
        <div
          key={i}
          className={`${styles.item} ${delta.amount > 0 ? styles.positive : styles.negative}`}
        >
          {STAT_LABELS[delta.stat]} {delta.amount > 0 ? '+' : ''}{delta.amount}
        </div>
      ))}
    </div>
  )
}
