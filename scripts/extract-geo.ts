/**
 * Map geometry extractor (build-time, run once).
 *
 * The map draws Brazil in full strength over a dimmed backdrop of the
 * surrounding countries. Shipping the whole world-atlas topology to the browser
 * for that is wasted bytes, so this lifts out just the two pieces and writes
 * them as plain GeoJSON, rounded to ~1 km:
 *
 *   src/data/brazil.json       Brazil alone, from countries-50m (crisp — it is
 *                              the subject of the map).
 *   src/data/context-land.json Every other country the frame can show, from
 *                              countries-110m (coarse is invisible once it is
 *                              stippled and dimmed, and keeps the file small).
 *
 * Countries are kept by bounding-box overlap with WINDOW, which must cover
 * whatever WorldMap's projection box exposes around Brazil — widen it if the
 * frame ever gets wider or the padding shrinks. Nothing is clipped to WINDOW:
 * the canvas already discards what falls outside the frame.
 *
 * Re-run only when changing resolution or the window:
 *   bun run scripts/extract-geo.ts
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { feature } from 'topojson-client'
import { geoBounds } from 'd3-geo'
import countries50m from 'world-atlas/countries-50m.json'
import countries110m from 'world-atlas/countries-110m.json'

/** ISO 3166-1 numeric code for Brazil, the geometry key in world-atlas. */
const BRAZIL_ID = '076'
/** Decimal places kept per coordinate (2 ≈ 1.1 km — finer than one map dot). */
const PRECISION = 2
/** [[west, south], [east, north]] the map frame can reach, plus margin. */
const WINDOW: [[number, number], [number, number]] = [
  [-100, -40],
  [-8, 13],
]

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const BRAZIL_PATH = join(root, 'src/data/brazil.json')
const CONTEXT_PATH = join(root, 'src/data/context-land.json')

const factor = 10 ** PRECISION
const round = (_key: string, value: unknown) =>
  typeof value === 'number' ? Math.round(value * factor) / factor : value

function write(path: string, geo: unknown): void {
  const json = JSON.stringify(geo, round)
  writeFileSync(path, json + '\n')
  console.log(`Wrote ${path} (${(json.length / 1024).toFixed(1)} KB)`)
}

// world-atlas ships untyped TopoJSON topologies; reach into them structurally.
type Countries = { objects: { countries: { geometries: Array<{ id?: string }> } } }
type Feat = { id?: string }

// --- Brazil, at 50m --------------------------------------------------------

const geometry = (countries50m as unknown as Countries).objects.countries.geometries.find(
  (g) => g.id === BRAZIL_ID,
)
if (!geometry) throw new Error(`no geometry with id ${BRAZIL_ID} in countries-50m`)
write(BRAZIL_PATH, feature(countries50m as never, geometry as never))

// --- everything around it, at 110m -----------------------------------------

const world = feature(
  countries110m as never,
  (countries110m as never as Countries).objects.countries as never,
) as unknown as { features: Feat[] }

const overlapsWindow = (f: Feat): boolean => {
  const [[west, south], [east, north]] = geoBounds(f as never)
  return (
    west <= WINDOW[1][0] && east >= WINDOW[0][0] && south <= WINDOW[1][1] && north >= WINDOW[0][1]
  )
}

const nearby = world.features.filter((f) => f.id !== BRAZIL_ID && overlapsWindow(f))
write(CONTEXT_PATH, { type: 'FeatureCollection', features: nearby })
console.log(`  ${nearby.length} surrounding countries`)
