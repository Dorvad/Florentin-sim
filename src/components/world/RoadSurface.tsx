// ── RoadSurface ────────────────────────────────────────────────────────────
// Replaces the old Kenney modular street tiles with a single flat pavement.
// Road: 6 m wide, centred on x=0.  Sidewalks: 8 m wide each side.
// Curbs are raised 3D boxes.  Centre line = white dashes every ~4.5 m.

const ROAD_Z     = -24   // world-z at the centre of the street length
const ROAD_LEN   = 66    // total z length (covers z=+9 → z=-57)
const ROAD_W     = 6     // road width  (x = -3 … +3)
const SW_W       = 8     // sidewalk width each side

const ASPHALT  = '#2a2a2a'
const CONCRETE = '#b8b0a4'
const CURB     = '#888070'
const MARKING  = '#e4e4cc'

const DASH_COUNT   = 14
const DASH_SPACING = ROAD_LEN / DASH_COUNT
const DASH_LEN     = DASH_SPACING * 0.55

export function RoadSurface() {
  return (
    <>
      {/* ── Asphalt road ──────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, ROAD_Z]} receiveShadow>
        <planeGeometry args={[ROAD_W, ROAD_LEN]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.92} metalness={0.04} />
      </mesh>

      {/* ── East sidewalk ─────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ROAD_W / 2 + SW_W / 2, 0.015, ROAD_Z]} receiveShadow>
        <planeGeometry args={[SW_W, ROAD_LEN]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.88} />
      </mesh>

      {/* ── West sidewalk ─────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(ROAD_W / 2 + SW_W / 2), 0.015, ROAD_Z]} receiveShadow>
        <planeGeometry args={[SW_W, ROAD_LEN]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.88} />
      </mesh>

      {/* ── East curb (raised 3-D box) ─────────────────────────────────── */}
      <mesh position={[ROAD_W / 2 + 0.15, 0.06, ROAD_Z]} receiveShadow castShadow>
        <boxGeometry args={[0.3, 0.12, ROAD_LEN]} />
        <meshStandardMaterial color={CURB} roughness={0.75} />
      </mesh>

      {/* ── West curb ─────────────────────────────────────────────────── */}
      <mesh position={[-(ROAD_W / 2 + 0.15), 0.06, ROAD_Z]} receiveShadow castShadow>
        <boxGeometry args={[0.3, 0.12, ROAD_LEN]} />
        <meshStandardMaterial color={CURB} roughness={0.75} />
      </mesh>

      {/* ── Solid edge lines (white strips at road edges) ─────────────── */}
      {([-1, 1] as const).map((side) => (
        <mesh
          key={side}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[side * (ROAD_W / 2 - 0.2), 0.02, ROAD_Z]}
          receiveShadow
        >
          <planeGeometry args={[0.1, ROAD_LEN]} />
          <meshStandardMaterial color={MARKING} roughness={0.5} />
        </mesh>
      ))}

      {/* ── Centre dashed line ─────────────────────────────────────────── */}
      {Array.from({ length: DASH_COUNT }, (_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, ROAD_Z + ROAD_LEN / 2 - (i + 0.5) * DASH_SPACING]}
          receiveShadow
        >
          <planeGeometry args={[0.1, DASH_LEN]} />
          <meshStandardMaterial color={MARKING} roughness={0.5} />
        </mesh>
      ))}
    </>
  )
}
