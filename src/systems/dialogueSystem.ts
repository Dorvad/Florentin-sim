import { dialogueTrees } from '@/data/dialogues'
import { useGameStore } from '@/stores/gameStore'
import type { DialogueNode, DialogueChoice } from '@/types'

// ── Dialogue system helpers ────────────────────────────────────────────────
// These functions are called by UI components and NPC interaction logic.
// They read/write through the game store, keeping UI components thin.

export function openDialogue(treeId: string, npcName: string): void {
  const tree = dialogueTrees[treeId]
  if (!tree) return
  useGameStore.getState().startDialogue({
    treeId,
    nodeId: tree.startNode,
    npcName,
  })
}

export function getCurrentNode(): DialogueNode | null {
  const { activeDialogue } = useGameStore.getState()
  if (!activeDialogue) return null
  const tree = dialogueTrees[activeDialogue.treeId]
  return tree?.nodes[activeDialogue.nodeId] ?? null
}

export function selectChoice(choice: DialogueChoice): void {
  const store = useGameStore.getState()

  // Apply stat effects
  if (choice.effects?.length) {
    store.applyStatDeltas(choice.effects)
  }

  // Start a quest if the choice triggers one
  if (choice.startsQuest) {
    store.startQuest(choice.startsQuest)
  }

  // Advance or end dialogue
  if (choice.nextNode) {
    store.advanceDialogue(choice.nextNode)
  } else {
    store.endDialogue()
  }
}

export function advanceToNextNode(nextNodeId: string | null): void {
  if (nextNodeId) {
    useGameStore.getState().advanceDialogue(nextNodeId)
  } else {
    useGameStore.getState().endDialogue()
  }
}
