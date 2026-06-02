import { useEffect } from 'react'
import { useGameStore } from '@/stores/gameStore'
import styles from './QuestNotification.module.css'

// ── QuestNotification ──────────────────────────────────────────────────────
// Banner that appears briefly when a new quest is added.
// Auto-dismisses after 4 seconds.

export function QuestNotification() {
  const notification        = useGameStore((s) => s.questNotification)
  const clearQuestNotification = useGameStore((s) => s.clearQuestNotification)

  useEffect(() => {
    if (!notification) return
    const timer = setTimeout(clearQuestNotification, 4000)
    return () => clearTimeout(timer)
  }, [notification, clearQuestNotification])

  if (!notification) return null

  return (
    <div className={styles.banner}>
      <span className={styles.label}>Quest Added</span>
      <span className={styles.title}>{notification}</span>
    </div>
  )
}
