import { dialogueTrees } from '@/data/dialogues'
import { useGameStore } from '@/stores/gameStore'
import type { DialogueNode, DialogueChoice } from '@/types'

// Trees that count as "apartment object interactions" for gating the exit door
const APARTMENT_OBJECT_TREES = new Set(['fridge_note', 'mirror', 'mattress'])

// ── Dialogue system helpers ────────────────────────────────────────────────

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

  // Mark apartment as interacted when player makes a choice on an object tree
  const treeId = store.activeDialogue?.treeId
  if (treeId && APARTMENT_OBJECT_TREES.has(treeId)) {
    store.markApartmentInteracted()
  }

  // Handle area transition (apartment ↔ street)
  if (choice.transitionArea) {
    store.endDialogue()
    store.setCurrentArea(choice.transitionArea)
    store.setPlayerPosition([0, 0, 0])
    return
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
