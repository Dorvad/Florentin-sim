import type { DialogueTree } from '@/types'

// ── Dialogue trees ─────────────────────────────────────────────────────────
// Each NPC references one tree by id.
// Add new trees here as new characters are written.

export const dialogueTrees: Record<string, DialogueTree> = {
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

  // TODO: Add more NPC dialogue trees here
}
