// ── Street ─────────────────────────────────────────────────────────────────
// A simple dark strip representing the main street running through the scene.
// Sits just above the ground plane (y=0.01) to avoid z-fighting.
// TODO: Replace with a proper road mesh or UV-mapped plane with road texture.

export function Street() {
  return (
    <>
      {/* Main street running north–south */}
      <mesh position={[0, 0.01, -8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 30]} />
        <meshStandardMaterial color="#7a7060" />
      </mesh>
      {/* Cross street running east–west */}
      <mesh position={[0, 0.01, -4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 6]} />
        <meshStandardMaterial color="#7a7060" />
      </mesh>
    </>
  )
}
