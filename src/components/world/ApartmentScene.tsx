import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import type { Mesh } from 'three'
import { useGameStore } from '@/stores/gameStore'
import { apartmentObjects } from '@/data/apartment'
import { useObjectInteraction } from '@/hooks/useObjectInteraction'
import { getNearestObjectInRange } from '@/systems/interactionSystem'
import { openDialogue } from '@/systems/dialogueSystem'
import type { InteractableObjectData } from '@/types'

// Plays once per page load — triggers the opening narration on first mount.
let openingPlayed = false

// ── ApartmentObject ────────────────────────────────────────────────────────

function ApartmentObject({ data }: { data: InteractableObjectData }) {
  const playerPosition = useGameStore((s) => s.playerPosition)
  const indicatorRef = useRef<Mesh>(null!)
  const [hw, hh, hd] = data.size

  const inRange = getNearestObjectInRange(playerPosition, [data]) !== null

  useFrame(({ clock }) => {
    if (!indicatorRef.current) return
    indicatorRef.current.visible = inRange
    indicatorRef.current.position.y =
      hh / 2 + 0.45 + Math.sin(clock.getElapsedTime() * 3) * 0.07
  })

  return (
    <group position={data.position}>
      {/* Object body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[hw, hh, hd]} />
        <meshStandardMaterial color={data.color} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Name label */}
      <Text
        position={[0, hh / 2 + 0.22, 0]}
        fontSize={0.17}
        color="#ffffffcc"
        anchorX="center"
        anchorY="bottom"
        renderOrder={1}
      >
        {data.name}
      </Text>

      {/* Proximity indicator — bobbing sphere, shown when in range */}
      <mesh ref={indicatorRef} position={[0, hh / 2 + 0.45, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial
          color="#f5c542"
          emissive="#f5c542"
          emissiveIntensity={0.9}
        />
      </mesh>
    </group>
  )
}

// ── ApartmentScene ─────────────────────────────────────────────────────────

export function ApartmentScene() {
  const apartmentInteracted = useGameStore((s) => s.apartmentInteracted)

  // Show door only after the player has interacted with at least one object
  const visibleObjects = apartmentObjects.filter(
    (o) => o.id !== 'apartment_door' || apartmentInteracted
  )

  useObjectInteraction(visibleObjects)

  // Trigger the opening narration exactly once per page load
  useEffect(() => {
    if (openingPlayed) return
    openingPlayed = true
    const { activeDialogue } = useGameStore.getState()
    if (!activeDialogue) {
      openDialogue('wakeup_narration', '')
    }
  }, [])

  return (
    <>
      {/* ── Floor ──────────────────────────────────────────────────────── */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 8]} />
        <meshStandardMaterial color="#c9b99a" roughness={0.9} />
      </mesh>

      {/* ── Ceiling ────────────────────────────────────────────────────── */}
      <mesh position={[0, 3.05, 0]}>
        <boxGeometry args={[8, 0.1, 8]} />
        <meshStandardMaterial color="#e0d8c8" roughness={1} />
      </mesh>

      {/* ── Walls ──────────────────────────────────────────────────────── */}
      {/* North wall (exit wall, z=-4) */}
      <mesh position={[0, 1.5, -4]} receiveShadow>
        <boxGeometry args={[8, 3, 0.1]} />
        <meshStandardMaterial color="#d4c9b4" roughness={0.9} />
      </mesh>
      {/* South wall (behind player / camera side, z=+4) */}
      <mesh position={[0, 1.5, 4]} receiveShadow>
        <boxGeometry args={[8, 3, 0.1]} />
        <meshStandardMaterial color="#d4c9b4" roughness={0.9} />
      </mesh>
      {/* East wall (x=+4) */}
      <mesh position={[4, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.1, 3, 8]} />
        <meshStandardMaterial color="#ccc2ae" roughness={0.9} />
      </mesh>
      {/* West wall (x=-4) */}
      <mesh position={[-4, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.1, 3, 8]} />
        <meshStandardMaterial color="#ccc2ae" roughness={0.9} />
      </mesh>

      {/* ── Interactable objects ────────────────────────────────────────── */}
      {visibleObjects.map((obj) => (
        <ApartmentObject key={obj.id} data={obj} />
      ))}
    </>
  )
}
