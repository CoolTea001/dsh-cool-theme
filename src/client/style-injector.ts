/**
 * Style injection helper: prefers DSH `styles.insert`, falls back to raw DOM.
 */

declare const styles: { insert: (css: string) => () => void }

export function createStyleInjector() {
  const disposers = new Set<() => void>()

  function track(dispose: () => void): () => void {
    const wrapped = () => {
      try {
        dispose()
      } catch {}
      disposers.delete(wrapped)
    }
    disposers.add(wrapped)
    return wrapped
  }

  function insert(css: string): () => void {
    try {
      if (typeof styles !== 'undefined' && typeof (styles as any).insert === 'function') {
        const dispose = (styles as any).insert(css) as () => void
        if (typeof dispose === 'function') return track(dispose)
      }
    } catch {}

    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-cool-theme'
    tag.textContent = css
    document.head.appendChild(tag)
    return track(() => tag.remove())
  }

  function disposeAll() {
    for (const d of [...disposers]) {
      try {
        d()
      } catch {}
    }
    disposers.clear()
  }

  return { insert, disposeAll }
}
