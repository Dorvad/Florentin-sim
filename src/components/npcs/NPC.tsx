import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import type { Mesh } from 'three'
import type { NPCData } from '@/types'
import { useGameStore } from '@/stores/gameStore'

interface NPCProps {
  data: NPCData
}

const INTERACTION_RADIUS = 2.5
const INDICATOR_BOB_SPEED = 2
const INDICATOR_BOB_AMOUNT = 0.15

// ── NPC ────────────────────────────────────────────────────────────────────
// Placeholder: a coloured box with a floating name label.
// When the player is within INTERACTION_RADIUS, an 'E' prompt floats above.
// TODO: Replace mesh internals with <primitive object={gltf.scene} /> once
//       .glb models exist. The interaction logic (distance check) stays here.

export function NPC({ data }: NPCProps) {
  const indicatorRef = useRef<Mesh>(null)
  const playerPosition = useGameStore((s) => s.playerPosition)
  const activeDialogue = useGameStore((s) => s.activeDialogue)

  const dx = playerPosition[0] - data.position[0]
  const dz = playerPosition[2] - data.position[2]
  const isNearby = Math.sqrt(dx * dx + dz * dz) <= INTERACTION_RADIUS
  const isThisNPCTalking =
    activeDialogue?.npcName === data.name

  useFrame(({ clock }) => {
    if (!indicatorRef.current) return
    if (!isNearby || isThisNPCTalking) return
    // Bob the 'E' prompt up and down
    indicatorRef.current.position.y =
      3.2 + Math.sin(clock.elapsedTime * INDICATOR_BOB_SPEED) * INDICATOR_BOB_AMOUNT
  })

  return (
    <group position={data.position}>
      {/* Body — swap this group's children for <primitive> when model is ready */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.6, 1.5, 0.4]} />
        <meshStandardMaterial color={data.color} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial color={data.color} />
      </mesh>

      {/* Name label — always visible */}
      <Text
        position={[0, 2.4, 0]}
        fontSize={0.22}
        color="white"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {data.name}
      </Text>

      {/* 'E to talk' indicator — visible when nearby and not in dialogue */}
      {isNearby && !isThisNPCTalking && (
        <mesh ref={indicatorRef} position={[0, 3.2, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#ffdd44" emissive="#ffdd44" emissiveIntensity={0.6} />
        </mesh>
      )}
    </group>
  )
}
