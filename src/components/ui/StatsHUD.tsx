import { useGameStore } from '@/stores/gameStore'
import type { PlayerStats } from '@/types'
import styles from './StatsHUD.module.css'

const STAT_LABELS: Record<keyof PlayerStats, string> = {
  energy: '⚡ Energy',
  money: '₪ Money',
  socialBattery: '💬 Social',
  vibe: '✨ Vibe',
}

const STAT_COLORS: Record<keyof PlayerStats, string> = {
  energy: '#f5c542',
  money: '#6fcf97',
  socialBattery: '#56ccf2',
  vibe: '#bb6bd9',
}

// ── StatsHUD ───────────────────────────────────────────────────────────────
// Always-visible corner panel showing the four player stats.
// Money is shown as a number; the rest as progress bars.

export function StatsHUD() {
  const stats = useGameStore((s) => s.playerStats)

  return (
    <div className={styles.hud}>
      {(Object.keys(stats) as Array<keyof PlayerStats>).map((key) => {
        const value = stats[key]
        const isNumeric = key === 'money'
        return (
          <div key={key} className={styles.stat}>
            <span className={styles.label}>{STAT_LABELS[key]}</span>
            {isNumeric ? (
              <span className={styles.value}>₪{value}</span>
            ) : (
              <div className={styles.barBg}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${value}%`,
                    backgroundColor: STAT_COLORS[key],
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
