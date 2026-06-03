import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Mesh, MeshStandardMaterial, SkinnedMesh } from 'three'
import { usePlayerMovement } from '@/hooks/usePlayerMovement'
import { useGameStore } from '@/stores/gameStore'

const MODEL_SCALE = 0.64
const CAMERA_OFFSET = { x: 0, y: 8, z: 10 }
const CAMERA_LERP = 0.1

const ANIM_IDLE = 'CharacterArmature|CharacterArmature|Idle'
const ANIM_WALK = 'CharacterArmature|CharacterArmature|Walk'

useGLTF.preload('/assets/models/player.glb')

export function Player() {
  const { meshRef, isMovingRef } = usePlayerMovement()
  const { scene, animations } = useGLTF('/assets/models/player.glb')
  const { actions } = useAnimations(animations, meshRef)
  const currentAnimRef = useRef<string | null>(null)
  const { camera } = useThree()

  // Fix materials once (useGLTF caches — this runs once per model load)
  useEffect(() => {
    scene.traverse((node) => {
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
  }, [scene])

  // Start idle animation after actions are ready
  useEffect(() => {
    if (!actions[ANIM_IDLE]) return
    actions[ANIM_IDLE]!.play()
    currentAnimRef.current = ANIM_IDLE
  }, [actions])

  useFrame(() => {
    // Camera follow — read store without subscribing to avoid stale-closure resets
    const [px, py, pz] = useGameStore.getState().playerPosition
    camera.position.lerp(
      { x: px + CAMERA_OFFSET.x, y: py + CAMERA_OFFSET.y, z: pz + CAMERA_OFFSET.z } as never,
      CAMERA_LERP
    )
    camera.lookAt(px, py + 1, pz)

    // Animation switching: idle ↔ walk
    const target = isMovingRef.current ? ANIM_WALK : ANIM_IDLE
    if (target !== currentAnimRef.current && actions[target]) {
      const outgoing = currentAnimRef.current ? actions[currentAnimRef.current] : null
      actions[target]!.reset().fadeIn(0.2).play()
      outgoing?.fadeOut(0.2)
      currentAnimRef.current = target
    }
  })

  // No position prop — movement hook owns the transform
  return (
    <group ref={meshRef}>
      <primitive object={scene} scale={MODEL_SCALE} castShadow />
    </group>
  )
}
