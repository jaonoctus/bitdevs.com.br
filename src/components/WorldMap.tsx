import { useEffect, useRef, useState } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection } from 'geojson'
import brazilGeo from '../data/brazil.json'
import contextGeo from '../data/context-land.json'
import type { BitDev } from '../types'
import { countryName, useI18n } from '../i18n'

// Pre-extracted geometry (see scripts/extract-geo.ts): Brazil at full strength,
// the surrounding countries dimmed behind it.
const brazil = brazilGeo as unknown as Feature
const contextLand = contextGeo as unknown as FeatureCollection

// Internal projection box. The dotted land is rendered at this resolution and
// scaled to fit the responsive frame; markers are placed as percentages of it.
const W = 1600
const H = 860
/** Vertical breathing room. Brazil is fitted to the height of the box and
 * centred, so the wide frame fills with its neighbours on either side. */
const PAD = 54

interface PlacedMarker {
  city: string
  country: string
  url: string
  leftPct: number
  topPct: number
}

interface Props {
  cities: BitDev[]
  activeIndex: number | null
  onHover: (index: number | null) => void
}

export default function WorldMap({ cities, activeIndex, onHover }: Props) {
  const { t } = useI18n()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [markers, setMarkers] = useState<PlacedMarker[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const projection = geoMercator().fitExtent(
      [
        [PAD, PAD],
        [W - PAD, H - PAD],
      ],
      brazil,
    )

    // 1) Rasterize each layer to an offscreen canvas once, then read its alpha
    //    channel as a fast point-in-shape test.
    const stencil = (geo: Feature | FeatureCollection): ((x: number, y: number) => boolean) => {
      const off = document.createElement('canvas')
      off.width = W
      off.height = H
      const octx = off.getContext('2d')
      if (!octx) return () => false
      octx.fillStyle = '#fff'
      octx.beginPath()
      geoPath(projection, octx)(geo)
      octx.fill()
      const data = octx.getImageData(0, 0, W, H).data
      return (x, y) => data[((y | 0) * W + (x | 0)) * 4 + 3] > 130
    }
    const inBrazil = stencil(brazil)
    const inContext = stencil(contextLand)

    // 2) Draw the dotted land on the visible (retina) canvas.
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    const token = (name: string, fallback: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback

    const gap = 9
    // Two passes so the fill colour is set twice rather than per dot. The
    // neighbours are separated from Brazil by both size and opacity — opacity
    // alone leaves the two reading as one landmass. Their pass also skips
    // anything inside Brazil: the layers come from different resolutions, so
    // coastlines overlap by a dot or so and a dim dot under a bright one would
    // show as a smudge.
    const layers: Array<{ color: string; r: number; keep: (x: number, y: number) => boolean }> = [
      {
        color: token('--color-land-dot-dim', 'rgba(156,161,170,0.10)'),
        r: 1.3,
        keep: (x, y) => !inBrazil(x, y) && inContext(x, y),
      },
      {
        color: token('--color-land-dot', 'rgba(156,161,170,0.62)'),
        r: 1.9,
        keep: inBrazil,
      },
    ]

    for (const layer of layers) {
      ctx.fillStyle = layer.color
      let row = 0
      for (let y = gap; y < H; y += gap * 0.9) {
        const xoff = row % 2 ? gap / 2 : 0
        for (let x = gap + xoff; x < W; x += gap) {
          if (layer.keep(x, y)) {
            ctx.beginPath()
            ctx.arc(x, y, layer.r, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        row++
      }
    }

    // 3) Project the cities into marker positions.
    const placed: PlacedMarker[] = []
    for (const d of cities) {
      const p = projection([d.lng, d.lat])
      if (!p) continue
      placed.push({
        city: d.city,
        country: d.country,
        url: d.url,
        leftPct: (p[0] / W) * 100,
        topPct: (p[1] / H) * 100,
      })
    }
    setMarkers(placed)
    setReady(true)
  }, [cities])

  return (
    <div className="map-frame">
      <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />

        {!ready && <div className="map-loading">{t.map.loading}</div>}

        {/* Markers keep the raw country from the data and are translated here,
            so switching language never re-runs the projection effect. */}
        {markers.map((m, i) => (
          <a
            key={`${m.city}-${i}`}
            className={`marker${activeIndex === i ? ' is-active' : ''}`}
            href={m.url}
            target="_blank"
            rel="noopener"
            style={{ left: `${m.leftPct}%`, top: `${m.topPct}%` }}
            aria-label={t.map.markerLabel(m.city, countryName(t, m.country))}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(i)}
            onBlur={() => onHover(null)}
          >
            <span className="ring" style={{ animationDelay: `${0.9 * i}s` }} />
            <span className="dot" />
            <span className="tip">
              {m.city}
              <i>{countryName(t, m.country)}</i>
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
