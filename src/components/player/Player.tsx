import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Vector3, Mesh, MeshStandardMaterial, SkinnedMesh } from 'three'
import { usePlayerMovement } from '@/hooks/usePlayerMovement'
import { useGameStore } from '@/stores/gameStore'
import { npcData } from '@/data/npcs'
import { getNPCWorldPosition } from '@/systems/interactionSystem'

const MODEL_SCALE  = 0.64
const CAMERA_OFFSET = { x: 0, y: 8, z: 10 }
const CAMERA_LERP  = 0.1
const ZOOM_LERP    = 0.06   // slower for a cinematic feel

const ANIM_IDLE = 'CharacterArmature|CharacterArmature|Idle'
const ANIM_WALK = 'CharacterArmature|CharacterArmature|Walk'

useGLTF.preload('/assets/models/player.glb')

// Reusable vectors to avoid per-frame allocations
const _target    = new Vector3()
const _lookAt    = new Vector3()
const _npcDir    = new Vector3()

export function Player() {
  const { meshRef, isMovingRef } = usePlayerMovement()
  const { scene, animations }   = useGLTF('/assets/models/player.glb')
  const { actions }             = useAnimations(animations, meshRef)
  const currentAnimRef          = useRef<string | null>(null)
  const { camera }              = useThree()

  useEffect(() => {
    scene.traverse((node) => {
      if (!(node instanceof Mesh) && !(node instanceof SkinnedMesh)) return
      node.castShadow = true
      const mats = Array.isArray(node.material) ? node.material : [node.material]
      mats.forEach((mat) => {
        if (mat instanceof MeshStandardMaterial) {
          mat.opacity     = 1
          mat.transparent = false
          mat.needsUpdate = true
        }
      })
    })
  }, [scene])

  useEffect(() => {
    if (!actions[ANIM_IDLE]) return
    actions[ANIM_IDLE]!.play()
    currentAnimRef.current = ANIM_IDLE
  }, [actions])

  useFrame(() => {
    const [px, py, pz] = useGameStore.getState().playerPosition
    const { activeDialogue } = useGameStore.getState()

    // ── Camera ────────────────────────────────────────────────────────────
    const isNPCDialogue = !!(activeDialogue?.npcName)
    const npc = isNPCDialogue
      ? npcData.find((n) => n.name === activeDialogue!.npcName)
      : null

    if (npc) {
      // Zoom to NPC face
      const [nx, , nz] = getNPCWorldPosition(npc.id, npc.position)
      const faceY = 1.25

      // Direction from NPC toward player — camera sits on player's side
      _npcDir.set(px - nx, 0, pz - nz)
      const hDist = _npcDir.length()
      if (hDist > 0.001) _npcDir.divideScalar(hDist)
      else                _npcDir.set(0, 0, 1)

      // Camera 2 m in front of face, slightly above eye level
      _target.set(nx + _npcDir.x * 2.0, faceY + 0.15, nz + _npcDir.z * 2.0)
      _lookAt.set(nx, faceY, nz)

      camera.position.lerp(_target, ZOOM_LERP)
      camera.lookAt(_lookAt)
    } else {
      // Standard follow camera
      _target.set(px + CAMERA_OFFSET.x, py + CAMERA_OFFSET.y, pz + CAMERA_OFFSET.z)
      camera.position.lerp(_target, CAMERA_LERP)
      camera.lookAt(px, py + 1, pz)
    }

    // ── Animation switching: idle ↔ walk ─────────────────────────────────
    const animTarget = isMovingRef.current ? ANIM_WALK : ANIM_IDLE
    if (animTarget !== currentAnimRef.current && actions[animTarget]) {
      const outgoing = currentAnimRef.current ? actions[currentAnimRef.current] : null
      actions[animTarget]!.reset().fadeIn(0.2).play()
      outgoing?.fadeOut(0.2)
      currentAnimRef.current = animTarget
    }
  })

  return (
    <group ref={meshRef}>
      <primitive object={scene} scale={MODEL_SCALE} castShadow />
    </group>
  )
}
