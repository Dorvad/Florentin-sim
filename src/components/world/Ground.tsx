import { GROUND_SIZE } from '@/data/world'

// ── Ground ─────────────────────────────────────────────────────────────────
// Flat plane representing the street/neighbourhood floor.
// TODO: Replace with a textured plane or imported terrain mesh later.

export function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
      <meshStandardMaterial color="#b8a898" polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
    </mesh>
  )
}
