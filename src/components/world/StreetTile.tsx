import type { Vector3Tuple } from 'three'
import { useMaterializedGLB } from '@/hooks/useMaterializedGLB'

interface StreetTileProps {
  position: Vector3Tuple
  rotation?: number   // Y rotation in radians
  modelPath: string
}

// ── StreetTile ─────────────────────────────────────────────────────────────
// Renders a single street / sidewalk GLB tile with PBR materials applied.

export function StreetTile({ position, rotation = 0, modelPath }: StreetTileProps) {
  const scene = useMaterializedGLB(modelPath)
  return <primitive object={scene} position={position} rotation-y={rotation} />
}
