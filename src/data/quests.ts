import type { QuestData } from '@/types'

// ── Quest definitions ──────────────────────────────────────────────────────
// Quests are started via dialogue choices (see dialogues.ts -> startsQuest).
// Objectives are marked complete by game systems when conditions are met.
// Rewards are applied to PlayerStats when the quest is completed.

export const questData: QuestData[] = [
  {
    id: 'falafel_run',
    title: 'Avi\'s Falafel Run',
    description: 'Grab a pita with extra amba from the falafel place on Vital Street for Avi.',
    giverNpcId: 'avi',
    objectives: [
      {
        id: 'buy_pita',
        description: 'Buy a pita with extra amba',
        completed: false,
      },
      {
        id: 'return_to_avi',
        description: 'Bring it back to Avi',
        completed: false,
      },
    ],
    rewards: [
      { stat: 'money', amount: 20 },
      { stat: 'socialBattery', amount: 10 },
      { stat: 'vibe', amount: 5 },
    ],
  },
  // TODO: Add more quests here
]
