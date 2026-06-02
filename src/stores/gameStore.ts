import { create } from 'zustand'
import type { GameState, PlayerStats, StatDelta, QuestState, ActiveDialogue, GameArea } from '@/types'
import { questData } from '@/data/quests'

// ── Initial state ──────────────────────────────────────────────────────────

const initialStats: PlayerStats = {
  energy: 80,
  money: 150,
  socialBattery: 70,
  vibe: 60,
}

const initialQuests: Record<string, QuestState> = Object.fromEntries(
  questData.map((q) => [
    q.id,
    {
      questId: q.id,
      status: 'available',
      objectives: q.objectives.map((o) => ({ ...o })),
    },
  ])
)

// ── Store actions ──────────────────────────────────────────────────────────

interface GameActions {
  setPlayerPosition: (pos: [number, number, number]) => void
  applyStatDeltas: (deltas: StatDelta[]) => void
  startDialogue: (dialogue: ActiveDialogue) => void
  advanceDialogue: (nodeId: string) => void
  endDialogue: () => void
  startQuest: (questId: string) => void
  completeObjective: (questId: string, objectiveId: string) => void
  completeQuest: (questId: string) => void
  toggleQuestLog: () => void
  setCurrentArea: (area: GameArea) => void
  markApartmentInteracted: () => void
  clearStatFeedback: () => void
  clearQuestNotification: () => void
}

const STAT_MIN: Record<keyof PlayerStats, number> = {
  energy: 0,
  money: 0,
  socialBattery: 0,
  vibe: 0,
}

const STAT_MAX: Record<keyof PlayerStats, number> = {
  energy: 100,
  money: Infinity,
  socialBattery: 100,
  vibe: 100,
}

function clampStat(key: keyof PlayerStats, value: number): number {
  return Math.min(STAT_MAX[key], Math.max(STAT_MIN[key], value))
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  // ── State ─────────────────────────────────────────────────────────────────
  playerPosition: [0, 0, 0],
  playerStats: initialStats,
  quests: initialQuests,
  activeDialogue: null,
  activeQuestLog: false,
  currentArea: 'apartment',
  apartmentInteracted: false,
  statFeedback: [],
  questNotification: null,

  // ── Actions ───────────────────────────────────────────────────────────────

  setPlayerPosition: (pos) => set({ playerPosition: pos }),

  applyStatDeltas: (deltas) =>
    set((state) => {
      const updated = { ...state.playerStats }
      const nonZero: StatDelta[] = []
      for (const delta of deltas) {
        const prev = updated[delta.stat]
        const next = clampStat(delta.stat, prev + delta.amount)
        const actual = next - prev
        updated[delta.stat] = next as never
        if (actual !== 0) nonZero.push({ stat: delta.stat, amount: actual })
      }
      return { playerStats: updated, statFeedback: nonZero }
    }),

  startDialogue: (dialogue) => set({ activeDialogue: dialogue }),

  advanceDialogue: (nodeId) =>
    set((state) => {
      if (!state.activeDialogue) return {}
      return { activeDialogue: { ...state.activeDialogue, nodeId } }
    }),

  endDialogue: () => set({ activeDialogue: null }),

  startQuest: (questId) =>
    set((state) => {
      const existing = state.quests[questId]
      if (!existing || existing.status === 'active' || existing.status === 'completed') return {}
      const def = questData.find((q) => q.id === questId)
      return {
        quests: {
          ...state.quests,
          [questId]: { ...existing, status: 'active' },
        },
        questNotification: def?.title ?? null,
      }
    }),

  completeObjective: (questId, objectiveId) =>
    set((state) => {
      const quest = state.quests[questId]
      if (!quest) return {}
      return {
        quests: {
          ...state.quests,
          [questId]: {
            ...quest,
            objectives: quest.objectives.map((o) =>
              o.id === objectiveId ? { ...o, completed: true } : o
            ),
          },
        },
      }
    }),

  completeQuest: (questId) => {
    const quest = get().quests[questId]
    if (!quest || quest.status !== 'active') return
    const definition = questData.find((q) => q.id === questId)
    if (!definition) return
    get().applyStatDeltas(definition.rewards)
    set((state) => ({
      quests: {
        ...state.quests,
        [questId]: { ...state.quests[questId], status: 'completed' },
      },
    }))
  },

  toggleQuestLog: () => set((state) => ({ activeQuestLog: !state.activeQuestLog })),

  setCurrentArea: (area) => set({ currentArea: area }),

  markApartmentInteracted: () => set({ apartmentInteracted: true }),

  clearStatFeedback: () => set({ statFeedback: [] }),

  clearQuestNotification: () => set({ questNotification: null }),
}))
