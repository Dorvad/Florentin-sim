import { useEffect, useRef, useMemo, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text, useGLTF, useAnimations } from '@react-three/drei'
import { Mesh, MeshStandardMaterial, SkinnedMesh } from 'three'
import { SkeletonUtils } from 'three-stdlib'
import type { Group } from 'three'
import type { MutableRefObject } from 'react'
import type { NPCData } from '@/types'
import { useGameStore } from '@/stores/gameStore'
import { INTERACTION_RADIUS, updateNPCPosition } from '@/systems/interactionSystem'

interface NPCProps {
  data: NPCData
}

const MODEL_SCALE = 0.64
const FEET_OFFSET = 0
const INDICATOR_BOB_SPEED = 2
const INDICATOR_BOB_AMOUNT = 0.15

const WANDER_RADIUS = 2.8
const WANDER_SPEED = 1.2
const IDLE_MIN = 2
const IDLE_MAX = 5

const IDLE_ANIM_NAMES = [
  'CharacterArmature|CharacterArmature|Idle',
  'Idle_Loop',
  'Idle',
]
const WALK_ANIM_NAMES = [
  'CharacterArmature|CharacterArmature|Walk',
  'Walk_Loop',
  'Walk',
]

// ── NPCPlaceholder ─────────────────────────────────────────────────────────

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

function NPCModel({
  modelPath,
  modelScale = MODEL_SCALE,
  animStateRef,
}: {
  modelPath: string
  modelScale?: number
  animStateRef: MutableRefObject<'idle' | 'walk'>
}) {
  const groupRef = useRef<Group>(null)
  const { scene, animations } = useGLTF(modelPath)
  // Clone so multiple NPCs sharing the same model path get independent scene graphs
  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene)
    c.traverse((node) => {
      if (!(node instanceof Mesh) && !(node instanceof SkinnedMesh)) return
      node.castShadow = true
      const mats = Array.isArray(node.material) ? node.material : [node.material]
      mats.forEach((mat) => {
        if (mat instanceof MeshStandardMaterial) {
          mat.opacity = 1
          mat.transparent = false
          mat.needsUpdate = true
        }
      })
    })
    return c
  }, [scene])
  const { actions } = useAnimations(animations, groupRef)
  const currentAnimRef = useRef<'idle' | 'walk' | null>(null)

  useEffect(() => {
    for (const name of IDLE_ANIM_NAMES) {
      if (actions[name]) {
        actions[name]!.reset().play()
        currentAnimRef.current = 'idle'
        break
      }
    }
  }, [actions])

  useFrame(() => {
    const desired = animStateRef.current
    if (desired === currentAnimRef.current) return

    if (desired === 'walk') {
      const idleName = IDLE_ANIM_NAMES.find((n) => actions[n])
      const walkName = WALK_ANIM_NAMES.find((n) => actions[n])
      if (walkName) {
        if (idleName) actions[idleName]?.fadeOut(0.2)
        actions[walkName]!.reset().fadeIn(0.2).play()
        currentAnimRef.current = 'walk'
      }
    } else {
      const walkName = WALK_ANIM_NAMES.find((n) => actions[n])
      const idleName = IDLE_ANIM_NAMES.find((n) => actions[n])
      if (idleName) {
        if (walkName) actions[walkName]?.fadeOut(0.2)
        actions[idleName]!.reset().fadeIn(0.2).play()
        currentAnimRef.current = 'idle'
      }
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={clone} scale={modelScale} position={[0, FEET_OFFSET, 0]} castShadow />
    </group>
  )
}

// ── NPC ────────────────────────────────────────────────────────────────────

export function NPC({ data }: NPCProps) {
  const npcGroupRef = useRef<Group>(null)
  const indicatorRef = useRef<Mesh>(null)
  const animStateRef = useRef<'idle' | 'walk'>('idle')

  const wanderRef = useRef({
    phase: 'idle' as 'idle' | 'walk',
    timer: Math.random() * (IDLE_MAX - IDLE_MIN) + IDLE_MIN,
    targetX: data.position[0],
    targetZ: data.position[2],
    homeX:   data.position[0],
    homeZ:   data.position[2],
  })

  // Set initial position imperatively so wander logic owns it from frame 1
  useEffect(() => {
    if (!npcGroupRef.current) return
    npcGroupRef.current.position.set(data.position[0], data.position[1], data.position[2])
    updateNPCPosition(data.id, data.position)
  }, []) // intentional: only on mount

  useFrame(({ clock }, delta) => {
    if (!npcGroupRef.current) return
    const pos   = npcGroupRef.current.position
    const w     = wanderRef.current
    const { playerPosition, activeDialogue } = useGameStore.getState()
    const isTalking = activeDialogue?.npcName === data.name

    // ── Wander state machine ─────────────────────────────────────────────
    if (!isTalking) {
      w.timer -= delta

      if (w.phase === 'idle') {
        animStateRef.current = 'idle'
        if (w.timer <= 0) {
          const angle  = Math.random() * Math.PI * 2
          const radius = Math.random() * WANDER_RADIUS
          w.targetX    = w.homeX + Math.cos(angle) * radius
          w.targetZ    = w.homeZ + Math.sin(angle) * radius
          w.phase      = 'walk'
        }
      } else {
        const dx   = w.targetX - pos.x
        const dz   = w.targetZ - pos.z
        const dist = Math.sqrt(dx * dx + dz * dz)

        if (dist < 0.08) {
          w.phase            = 'idle'
          w.timer            = Math.random() * (IDLE_MAX - IDLE_MIN) + IDLE_MIN
          animStateRef.current = 'idle'
        } else {
          animStateRef.current = 'walk'
          const step = Math.min(WANDER_SPEED * delta, dist)
          pos.x += (dx / dist) * step
          pos.z += (dz / dist) * step
          npcGroupRef.current.rotation.y = Math.atan2(dx, dz)
        }
      }
    } else {
      animStateRef.current = 'idle'
    }

    // Publish live position for interaction range checks
    updateNPCPosition(data.id, [pos.x, pos.y, pos.z])

    // ── Indicator visibility + bob ───────────────────────────────────────
    if (indicatorRef.current) {
      const pdx    = playerPosition[0] - pos.x
      const pdz    = playerPosition[2] - pos.z
      const inRange = Math.sqrt(pdx * pdx + pdz * pdz) <= INTERACTION_RADIUS
      indicatorRef.current.visible = inRange && !isTalking
      if (inRange) {
        indicatorRef.current.position.y =
          2.6 + Math.sin(clock.elapsedTime * INDICATOR_BOB_SPEED) * INDICATOR_BOB_AMOUNT
      }
    }
  })

  return (
    <group ref={npcGroupRef}>
      {data.modelPath ? (
        <Suspense fallback={<NPCPlaceholder color={data.color} />}>
          <NPCModel
            modelPath={data.modelPath}
            modelScale={data.modelScale}
            animStateRef={animStateRef}
          />
        </Suspense>
      ) : (
        <NPCPlaceholder color={data.color} />
      )}

      <Billboard>
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
      </Billboard>

      {/* Always mounted — visibility toggled imperatively in useFrame */}
      <mesh ref={indicatorRef} position={[0, 2.6, 0]} visible={false}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffdd44" emissive="#ffdd44" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}
