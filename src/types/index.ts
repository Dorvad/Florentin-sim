import type { Vector3Tuple } from 'three'

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

export interface DialogueChoice {
  label: string
  // Leads to a node id, or null to end dialogue
  nextNode: string | null
  // Optional stat effects triggered by choosing this option
  effects?: StatDelta[]
  // Optional quest to start when this choice is made
  startsQuest?: string
}

export interface DialogueNode {
  id: string
  lines: DialogueLine[]
  // When choices are absent the dialogue auto-advances or ends
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
  color: string          // fallback placeholder colour when no model is loaded
  modelPath?: string     // public-folder path to the character's .glb asset
  dialogueTreeId: string
  // questIds this NPC can offer (looked up from questData)
  questIds?: string[]
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
  size: Vector3Tuple     // [width, height, depth]
  color: string
  // modelPath?: string  // TODO: replace with .glb when assets are ready
  label?: string
}

// ── Game State (top-level shape used by the store) ────────────────────────────

export interface GameState {
  playerPosition: Vector3Tuple
  playerStats: PlayerStats
  quests: Record<string, QuestState>
  activeDialogue: ActiveDialogue | null
  activeQuestLog: boolean
}

export interface ActiveDialogue {
  treeId: string
  nodeId: string
  npcName: string
}
