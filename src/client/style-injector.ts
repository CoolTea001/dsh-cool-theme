/**
 * Style injection helper: prefers DSH `styles.insert`, falls back to raw DOM.
 */

declare const styles: { insert: (css: string) => () => void } | undefined

/** Hand one sheet to DSH's style service when it is present; null otherwise. */
function insertViaPlatform(css: string): (() => void) | null {
  try {
    if (typeof styles === 'undefined' || typeof styles.insert !== 'function') return null
    const dispose = styles.insert(css)
    return typeof dispose === 'function' ? dispose : null
  } catch {
    return null
  }
}

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
    const platformDispose = insertViaPlatform(css)
    if (platformDispose) return track(platformDispose)

    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-cool-theme'
    tag.textContent = css
    document.head.appendChild(tag)
    return track(() => tag.remove())
  }

  function disposeAll(): void {
    // Every disposer is a tracked wrapper, which already swallows its own error.
    for (const dispose of [...disposers]) dispose()
  }

  return { insert, disposeAll }
}
