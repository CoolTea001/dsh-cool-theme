export function hexLum(hex: string): number {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return r * 0.299 + g * 0.587 + b * 0.114
}

export function pickCodeBlockColors(p: any): { banner: string; block: string } {
  const page: string = p.base ?? p.l1
  const isLight = hexLum(page) > 128

  const brightest = (colors: string[]) => {
    let best = colors[0]
    let max = -1
    for (const c of colors) {
      const l = hexLum(c)
      if (l > max) {
        max = l
        best = c
      }
    }
    return best
  }

  if (isLight) {
    const banner = brightest([p.l1, p.l2, p.l3].filter((c: string) => c !== page))
    const bannerLum = hexLum(banner)
    // Body: brightest color still darker than banner (one step down), keep it light
    let block: string | undefined
    let bestL = -1
    for (const c of [p.l2, p.l3, p.b1] as string[]) {
      if (c === page || c === banner) continue
      const l = hexLum(c)
      if (l < bannerLum && l > bestL) {
        bestL = l
        block = c
      }
    }
    const resolved = block ?? ([p.l2, p.l3, p.b1] as string[]).find((c) => c !== page && c !== banner) ?? p.l2
    if (hexLum(banner) < hexLum(resolved)) return { banner: resolved, block: banner }
    if (banner === resolved) return { banner, block: p.l3 !== banner ? p.l3 : p.b1 }
    return { banner, block: resolved }
  }

  // Dark page: header = brightest, body = darkest distinct from page/header but still above page
  const banner = brightest([p.l3, p.b1, p.b2, p.l2].filter((c) => c !== page))
  let block = [p.l2, p.l3, p.b1, p.b2].find((c) => c !== page && c !== banner) ?? p.l2
  // Prefer the dimmest candidate (closest to page, still visible) for body
  {
    let min = Infinity
    for (const c of [p.l2, p.b1, p.l3, p.b2]) {
      if (c === page || c === banner) continue
      const l = hexLum(c)
      if (l < min) {
        min = l
        block = c
      }
    }
  }
  if (hexLum(banner) < hexLum(block)) return { banner: block, block: banner }
  if (block === page) block = p.l2 !== banner ? p.l2 : p.b1
  if (banner === block) block = p.b2 !== banner ? p.b2 : p.b1
  return { banner, block }
}
