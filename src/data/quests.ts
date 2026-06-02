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
      { id: 'buy_pita', description: 'Buy a pita with extra amba', completed: false },
      { id: 'return_to_avi', description: 'Bring it back to Avi', completed: false },
    ],
    rewards: [
      { stat: 'money', amount: 20 },
      { stat: 'socialBattery', amount: 10 },
      { stat: 'vibe', amount: 5 },
    ],
  },

  {
    id: 'move_mystery_bicycle',
    title: 'Move the Mystery Bicycle',
    description: 'A bicycle is blocking the building entrance. Moti has decided this is now your problem.',
    giverNpcId: 'moti',
    objectives: [
      { id: 'find_owner', description: 'Find out who owns the bicycle', completed: false },
      { id: 'move_bicycle', description: 'Move the bicycle from the entrance', completed: false },
    ],
    rewards: [
      { stat: 'vibe', amount: 5 },
      { stat: 'socialBattery', amount: 5 },
    ],
  },

  {
    id: 'clear_your_name',
    title: 'Clear Your Name',
    description: 'Moti suspects you are responsible for the bicycle. Prove your innocence, or at least become less suspicious.',
    giverNpcId: 'moti',
    objectives: [
      { id: 'ask_neighbors', description: 'Ask neighbors about the bicycle', completed: false },
      { id: 'find_real_owner', description: 'Find the real owner', completed: false },
    ],
    rewards: [
      { stat: 'vibe', amount: 3 },
      { stat: 'socialBattery', amount: 3 },
    ],
  },
]
