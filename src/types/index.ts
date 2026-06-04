import type { Vector3Tuple } from 'three'

export type { Vector3Tuple }

// ── Player ────────────────────────────────────────────────────────────────────

export interface PlayerStats {
  energy: number        // 0–100
  money: number         // ₪, unbounded
  socialBattery: number // 0–100
  vibe: number          // 0–100
}

export type StatKey = keyof PlayerStats

export interface StatDelta {
  stat: StatKey
  amount: number
}

// ── Dialogue ──────────────────────────────────────────────────────────────────

export interface DialogueLine {
  speaker: string
  text: string
}

export type GameArea = 'apartment' | 'street'

export interface DialogueChoice {
  label: string
  nextNode: string | null
  effects?: StatDelta[]
  startsQuest?: string
  // Triggers a scene/area transition when chosen
  transitionArea?: GameArea
}

export interface DialogueNode {
  id: string
  lines: DialogueLine[]
  choices?: DialogueChoice[]
}

export interface DialogueTree {
  id: string
  startNode: string
  nodes: Record<string, DialogueNode>
}

// ── NPCs ──────────────────────────────────────────────────────────────────────

export interface NPCData {
  id: string
  name: string
  position: Vector3Tuple
  color: string
  modelPath?: string
  modelScale?: number
  dialogueTreeId: string
  questIds?: string[]
}

// ── Interactable Objects (apartment props, quest items, etc.) ─────────────────

export interface InteractableObjectData {
  id: string
  name: string
  position: Vector3Tuple
  color: string
  size: Vector3Tuple
  dialogueTreeId: string
  modelPath?: string   // optional GLB to render instead of the default colored box
  rotation?: number    // optional Y-axis rotation in radians
}

// ── Quests ────────────────────────────────────────────────────────────────────

export type QuestStatus = 'unavailable' | 'available' | 'active' | 'completed' | 'failed'

export interface QuestObjective {
  id: string
  description: string
  completed: boolean
}

export interface QuestData {
  id: string
  title: string
  description: string
  giverNpcId: string
  objectives: QuestObjective[]
  rewards: StatDelta[]
}

export interface QuestState {
  questId: string
  status: QuestStatus
  objectives: QuestObjective[]
}

// ── World / Environment ───────────────────────────────────────────────────────

export interface BuildingData {
  id: string
  position: Vector3Tuple
  size: Vector3Tuple
  color: string
  modelPath?: string
  rotation?: number
  label?: string
}

export interface StreetTileData {
  id: string
  modelPath: string
  position: Vector3Tuple
  rotation?: number
}

export interface StreetPropData {
  id: string
  modelPath: string
  position: Vector3Tuple
  rotation?: number
  scale?: number
}

// ── Game State ────────────────────────────────────────────────────────────────

export interface ActiveDialogue {
  treeId: string
  nodeId: string
  npcName: string
}

export interface GameState {
  playerPosition: Vector3Tuple
  playerStats: PlayerStats
  quests: Record<string, QuestState>
  activeDialogue: ActiveDialogue | null
  activeQuestLog: boolean
  currentArea: GameArea
  apartmentInteracted: boolean
  statFeedback: StatDelta[]
  questNotification: string | null
}
