import type { DialogueTree } from '@/types'

// ── Dialogue trees ─────────────────────────────────────────────────────────
// Each NPC/object references one tree by id.

export const dialogueTrees: Record<string, DialogueTree> = {

  // ── Apartment: opening narration ──────────────────────────────────────────

  wakeup_narration: {
    id: 'wakeup_narration',
    startNode: 'narration',
    nodes: {
      narration: {
        id: 'narration',
        lines: [
          { speaker: '', text: 'You wake up in your Florentin apartment.' },
          { speaker: '', text: 'The sun is too bright, the street is already loud, and someone downstairs is drilling directly into your soul.' },
        ],
      },
    },
  },

  // ── Apartment: inspectable objects ────────────────────────────────────────

  fridge_note: {
    id: 'fridge_note',
    startNode: 'inspect',
    nodes: {
      inspect: {
        id: 'inspect',
        lines: [
          { speaker: 'Fridge Note', text: 'Roommate Note:' },
          { speaker: 'Fridge Note', text: '"Dor, please don\'t forget Va\'ad Bayit. Also someone stole my oat milk again. Not accusing anyone. Just saying."' },
        ],
        choices: [
          {
            label: 'I should probably pay Va\'ad Bayit.',
            nextNode: 'result_vaad',
            effects: [{ stat: 'vibe', amount: 1 }],
          },
          {
            label: 'I should probably investigate the oat milk situation.',
            nextNode: 'result_oatmilk',
            effects: [{ stat: 'vibe', amount: 1 }],
          },
          {
            label: 'I should probably go back to sleep.',
            nextNode: 'result_sleep',
            effects: [{ stat: 'energy', amount: -2 }, { stat: 'vibe', amount: -1 }],
          },
        ],
      },
      result_vaad: {
        id: 'result_vaad',
        lines: [
          { speaker: '', text: 'A responsible thought enters your mind. It is alone, but it is there.' },
        ],
      },
      result_oatmilk: {
        id: 'result_oatmilk',
        lines: [
          { speaker: '', text: 'A mystery is born. A very small, refrigerated mystery.' },
        ],
      },
      result_sleep: {
        id: 'result_sleep',
        lines: [
          { speaker: '', text: 'You lie down for exactly 11 seconds before a scooter alarm starts screaming outside.' },
        ],
      },
    },
  },

  mirror: {
    id: 'mirror',
    startNode: 'inspect',
    nodes: {
      inspect: {
        id: 'inspect',
        lines: [
          { speaker: 'Mirror', text: 'You look in the mirror.' },
          { speaker: 'Mirror', text: 'You are technically a functioning adult.' },
        ],
        choices: [
          {
            label: 'Fix hair.',
            nextNode: 'result_hair',
            effects: [{ stat: 'socialBattery', amount: 1 }],
          },
          {
            label: 'Practice cool confident face.',
            nextNode: 'result_face',
            effects: [{ stat: 'socialBattery', amount: 1 }, { stat: 'vibe', amount: -1 }],
          },
          {
            label: 'Whisper: "Today I become a better person."',
            nextNode: 'result_mantra',
            effects: [{ stat: 'vibe', amount: 1 }],
          },
        ],
      },
      result_hair: {
        id: 'result_hair',
        lines: [
          { speaker: '', text: 'Your hair reaches "acceptable creative professional" status.' },
        ],
      },
      result_face: {
        id: 'result_face',
        lines: [
          { speaker: '', text: 'You look like someone who is about to ask a barista if they have oat milk.' },
        ],
      },
      result_mantra: {
        id: 'result_mantra',
        lines: [
          { speaker: '', text: 'It felt silly, but not completely useless.' },
        ],
      },
    },
  },

  mattress: {
    id: 'mattress',
    startNode: 'inspect',
    nodes: {
      inspect: {
        id: 'inspect',
        lines: [
          { speaker: 'Mattress', text: 'Your mattress sits directly on the floor, because apparently minimalism and financial reality sometimes look identical.' },
        ],
        choices: [
          {
            label: 'Make the bed.',
            nextNode: 'result_make',
            effects: [{ stat: 'vibe', amount: 2 }],
          },
          {
            label: 'Leave it as it is.',
            nextNode: 'result_leave',
          },
          {
            label: 'Sit on the edge and stare into space.',
            nextNode: 'result_stare',
            effects: [{ stat: 'energy', amount: -1 }, { stat: 'vibe', amount: 1 }],
          },
        ],
      },
      result_make: {
        id: 'result_make',
        lines: [
          { speaker: '', text: 'A small act of civilization.' },
        ],
      },
      result_leave: {
        id: 'result_leave',
        lines: [
          { speaker: '', text: 'The bed understands. The bed does not judge.' },
        ],
      },
      result_stare: {
        id: 'result_stare',
        lines: [
          { speaker: '', text: 'You spend a moment thinking about everything and nothing.' },
        ],
      },
    },
  },

  apartment_door: {
    id: 'apartment_door',
    startNode: 'prompt',
    nodes: {
      prompt: {
        id: 'prompt',
        lines: [
          { speaker: 'Front Door', text: 'Leave apartment?' },
        ],
        choices: [
          {
            label: 'Yes, face the day.',
            nextNode: null,
            transitionArea: 'street',
          },
          {
            label: 'Not yet.',
            nextNode: null,
          },
        ],
      },
    },
  },

  // ── Street NPCs ───────────────────────────────────────────────────────────

  moti_intro: {
    id: 'moti_intro',
    startNode: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        lines: [
          { speaker: 'Moti', text: 'Ah, finally. You\'re alive. Listen, are you the one with the bicycle in the entrance?' },
        ],
        choices: [
          {
            label: 'No, but emotionally I support bicycles.',
            nextNode: 'response_emotional',
            effects: [{ stat: 'socialBattery', amount: 1 }],
            startsQuest: 'move_mystery_bicycle',
          },
          {
            label: 'Maybe. Depends who\'s asking.',
            nextNode: 'response_suspicious',
            startsQuest: 'clear_your_name',
          },
          {
            label: 'Sorry, I\'ll move it.',
            nextNode: 'response_agreeable',
            effects: [{ stat: 'vibe', amount: 1 }],
            startsQuest: 'move_mystery_bicycle',
          },
        ],
      },
      response_emotional: {
        id: 'response_emotional',
        lines: [
          { speaker: 'Moti', text: 'Very funny. You young people, everything is emotions. Move the bicycle.' },
        ],
      },
      response_suspicious: {
        id: 'response_suspicious',
        lines: [
          { speaker: 'Moti', text: 'I\'m asking. The building is asking. The entire staircase is asking.' },
        ],
      },
      response_agreeable: {
        id: 'response_agreeable',
        lines: [
          { speaker: 'Moti', text: 'Good. Finally someone with chinuch.' },
        ],
      },
    },
  },

  avi_intro: {
    id: 'avi_intro',
    startNode: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        lines: [
          { speaker: 'Avi', text: 'Hey! You new around here?' },
          { speaker: 'Avi', text: 'Florentin can be wild if you don\'t know the right spots.' },
        ],
        choices: [
          { label: 'Yeah, just moved in. Any tips?', nextNode: 'tips' },
          { label: 'Not really, just passing through.', nextNode: 'brush_off' },
        ],
      },
      tips: {
        id: 'tips',
        lines: [
          { speaker: 'Avi', text: 'The falafel place on Vital Street is open until 2 AM. That\'s tip number one.' },
          { speaker: 'Avi', text: 'Oh — and I actually need a favour. You up for it?' },
        ],
        choices: [
          {
            label: 'Sure, what do you need?',
            nextNode: 'quest_offer',
            startsQuest: 'falafel_run',
          },
          {
            label: 'Maybe another time.',
            nextNode: 'quest_declined',
            effects: [{ stat: 'socialBattery', amount: -5 }],
          },
        ],
      },
      quest_offer: {
        id: 'quest_offer',
        lines: [
          { speaker: 'Avi', text: 'Grab me a pita with extra amba from that falafel place. I\'m stuck here.' },
          { speaker: 'Avi', text: 'I\'ll pay you back, I promise.' },
        ],
      },
      quest_declined: {
        id: 'quest_declined',
        lines: [
          { speaker: 'Avi', text: 'No worries. Catch you around, yeah?' },
        ],
      },
      brush_off: {
        id: 'brush_off',
        lines: [
          { speaker: 'Avi', text: 'Fair enough. Watch out for the cats on Vital — they\'re aggressive.' },
        ],
      },
    },
  },

  dana_intro: {
    id: 'dana_intro',
    startNode: 'greeting',
    nodes: {
      greeting: {
        id: 'greeting',
        lines: [
          { speaker: 'Dana', text: 'Excuse me — do you have the time?' },
        ],
        choices: [
          {
            label: 'Sure, it\'s about 11.',
            nextNode: 'thanks',
            effects: [{ stat: 'socialBattery', amount: -3 }],
          },
          { label: 'Sorry, no phone on me.', nextNode: 'ok' },
        ],
      },
      thanks: {
        id: 'thanks',
        lines: [
          { speaker: 'Dana', text: 'Thanks! I\'m so late to my ceramics class.' },
        ],
      },
      ok: {
        id: 'ok',
        lines: [
          { speaker: 'Dana', text: 'No worries, I\'ll just check the coffee shop.' },
        ],
      },
    },
  },
}
