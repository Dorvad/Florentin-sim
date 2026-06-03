import { useMemo, useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useGLTF } from '@react-three/drei'
import type { Mesh } from 'three'
import type { NPCData } from '@/types'
import { useGameStore } from '@/stores/gameStore'

interface NPCProps {
  data: NPCData
}

const INTERACTION_RADIUS = 2.5
const MODEL_SCALE = 0.64
const FEET_OFFSET = MODEL_SCALE
const INDICATOR_BOB_SPEED = 2
const INDICATOR_BOB_AMOUNT = 0.15

// ── NPCPlaceholder ────────────────────────────────────────────────────────
// Shown while the GLB is loading or when no model path is provided.

function NPCPlaceholder({ color }: { color: string }) {
  return (
    <>
      <mesh position={[0, 0.75, 0]} castShadow>
        <capsuleGeometry args={[0.25, 1.0, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </>
  )
}

// ── NPCModel ───────────────────────────────────────────────────────────────
// Separate component so useGLTF is always called unconditionally.
// Each NPC model path is unique so we don't need to clone.

function NPCModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath)
  const clone = useMemo(() => scene.clone(true), [scene])
  return (
    <primitive
      object={clone}
      scale={MODEL_SCALE}
      position={[0, FEET_OFFSET, 0]}
      castShadow
    />
  )
}

// ── NPC ────────────────────────────────────────────────────────────────────
// Renders a character at the given world position.
// If data.modelPath is set, uses the GLB model; otherwise falls back to
// placeholder geometry so the game still runs without assets.

export function NPC({ data }: NPCProps) {
  const indicatorRef = useRef<Mesh>(null)
  const playerPosition = useGameStore((s) => s.playerPosition)
  const activeDialogue = useGameStore((s) => s.activeDialogue)

  const dx = playerPosition[0] - data.position[0]
  const dz = playerPosition[2] - data.position[2]
  const isNearby = Math.sqrt(dx * dx + dz * dz) <= INTERACTION_RADIUS
  const isThisNPCTalking = activeDialogue?.npcName === data.name

  useFrame(({ clock }) => {
    if (!indicatorRef.current || !isNearby || isThisNPCTalking) return
    indicatorRef.current.position.y =
      2.6 + Math.sin(clock.elapsedTime * INDICATOR_BOB_SPEED) * INDICATOR_BOB_AMOUNT
  })

  return (
    <group position={data.position}>
      {/* ── Mesh: GLB model or placeholder ──────────────────────────────── */}
      {data.modelPath ? (
        <Suspense fallback={<NPCPlaceholder color={data.color} />}>
          <NPCModel modelPath={data.modelPath} />
        </Suspense>
      ) : (
        <NPCPlaceholder color={data.color} />
      )}

      {/* ── Name label ──────────────────────────────────────────────────── */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.22}
        color="white"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {data.name}
      </Text>

      {/* ── 'E to talk' indicator ───────────────────────────────────────── */}
      {isNearby && !isThisNPCTalking && (
        <mesh ref={indicatorRef} position={[0, 2.6, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#ffdd44" emissive="#ffdd44" emissiveIntensity={0.6} />
        </mesh>
      )}
    </group>
  )
}
