/**
 * Types for the artwork under `assets/`.
 *
 * `tsdown`'s `loader` map (see tsdown.config.ts) resolves an `*.svg` import to a
 * module whose default export is the file's own text. That is how `icons.tsx`
 * reads the markup it renders, so this declaration is what keeps `tsc` honest
 * about those imports without shipping a loader into the type surface.
 */

declare module '*.svg' {
  const markup: string
  export default markup
}
