import { useGameStore } from '@/stores/gameStore'
import { questData } from '@/data/quests'
import styles from './QuestLog.module.css'

const STATUS_LABEL: Record<string, string> = {
  available: 'Available',
  active: 'Active',
  completed: 'Done',
  failed: 'Failed',
  unavailable: '',
}

// ── QuestLog ───────────────────────────────────────────────────────────────
// Toggle with Q key (wired in App.tsx). Lists quests and their objectives.

export function QuestLog() {
  const quests = useGameStore((s) => s.quests)
  const activeQuestLog = useGameStore((s) => s.activeQuestLog)

  if (!activeQuestLog) return null

  const visible = Object.values(quests).filter((q) => q.status !== 'unavailable')

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>Quest Log</div>
        {visible.length === 0 && (
          <p className={styles.empty}>No quests yet. Talk to people.</p>
        )}
        {visible.map((questState) => {
          const def = questData.find((q) => q.id === questState.questId)
          if (!def) return null
          return (
            <div key={questState.questId} className={styles.quest}>
              <div className={styles.questHeader}>
                <span className={styles.questTitle}>{def.title}</span>
                <span className={`${styles.badge} ${styles[questState.status]}`}>
                  {STATUS_LABEL[questState.status]}
                </span>
              </div>
              <p className={styles.desc}>{def.description}</p>
              <ul className={styles.objectives}>
                {questState.objectives.map((obj) => (
                  <li key={obj.id} className={obj.completed ? styles.done : ''}>
                    {obj.completed ? '✓' : '○'} {obj.description}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        <div className={styles.hint}>Press Q to close</div>
      </div>
    </div>
  )
}
