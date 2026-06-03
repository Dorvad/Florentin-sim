import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Mesh } from 'three'
import type { StreetPropData } from '@/types'

// ── StreetProp ─────────────────────────────────────────────────────────────
// Renders a GLB asset (car, bench, tree, lamp, etc.) with preserved original
// materials. Does NOT apply the game's PBR material overrides so that
// Kenney atlas textures load correctly via their embedded URI references.

export function StreetProp({ data }: { data: StreetPropData }) {
  const { scene } = useGLTF(data.modelPath)

  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((node) => {
      if (node instanceof Mesh) {
        node.castShadow = true
        node.receiveShadow = true
      }
    })
    return c
  }, [scene])

  return (
    <primitive
      object={clone}
      position={data.position}
      rotation-y={data.rotation ?? 0}
      scale={data.scale ?? 1}
    />
  )
}
