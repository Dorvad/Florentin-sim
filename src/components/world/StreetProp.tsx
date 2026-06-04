import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Mesh, MeshStandardMaterial, Color } from 'three'
import type { StreetPropData } from '@/types'

// ── StreetProp ─────────────────────────────────────────────────────────────
// Renders a GLB asset (car, bench, tree, lamp, etc.) with preserved original
// materials. Does NOT apply the game's PBR material overrides so that
// Kenney atlas textures load correctly via their embedded URI references.
// Optional materialColors map overrides specific material colours by name
// (used for nature assets whose texture files are missing).

export function StreetProp({ data }: { data: StreetPropData }) {
  const { scene } = useGLTF(data.modelPath)

  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((node) => {
      if (!(node instanceof Mesh)) return
      node.castShadow = true
      node.receiveShadow = true
      if (data.materialColors) {
        // scene.clone shares materials — clone each one before mutating
        if (Array.isArray(node.material)) {
          node.material = (node.material as MeshStandardMaterial[]).map((mat) => {
            const override = data.materialColors![mat.name]
            if (override && mat instanceof MeshStandardMaterial) {
              const m = mat.clone()
              m.color = new Color(override)
              m.needsUpdate = true
              return m
            }
            return mat
          })
        } else if (node.material instanceof MeshStandardMaterial) {
          const override = data.materialColors![node.material.name]
          if (override) {
            const m = (node.material as MeshStandardMaterial).clone()
            m.color = new Color(override)
            m.needsUpdate = true
            node.material = m
          }
        }
      }
    })
    return c
  }, [scene, data.materialColors])

  return (
    <primitive
      object={clone}
      position={data.position}
      rotation-y={data.rotation ?? 0}
      scale={data.scale ?? 1}
    />
  )
}
