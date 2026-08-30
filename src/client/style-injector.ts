/**
 * Style injection helper: prefers DSH `styles.insert`, falls back to raw DOM.
 */

declare const styles: { insert: (css: string) => () => void }

export function createStyleInjector() {
  const disposers = new Set<() => void>()

  function insert(css: string): () => void {
    try {
      if (typeof styles !== 'undefined' && typeof (styles as any).insert === 'function') {
        const dispose = (styles as any).insert(css) as () => void
        const wrapped = () => {
          try {
            dispose?.()
          } catch {}
          disposers.delete(wrapped)
        }
        disposers.add(wrapped)
        return wrapped
      }
    } catch {}

    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-cool-theme'
    tag.textContent = css
    document.head.appendChild(tag)
    const wrapped = () => {
      tag.remove()
      disposers.delete(wrapped)
    }
    disposers.add(wrapped)
    return wrapped
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
