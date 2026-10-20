/**
 * Host entry for dsh-cool-theme.
 *
 * Owns the theme files: the browser half cannot touch the filesystem, so every
 * roster change travels over one same-origin prefix route below
 * {@link THEME_API_PREFIX}. The route is the whole host surface — no service is
 * provided, and nothing here interprets the theme payload beyond moving it.
 *
 * Media has two routes of its own below a theme id: one accepts the bytes of a
 * background image, one serves a stored file back. Everything else about a
 * theme — its document, its colours, its background reference — travels through
 * the roster route.
 */
export declare const name = "dsh-cool-theme";
export declare const inject: string[];
export declare function apply(ctx: any): void;
//# sourceMappingURL=index.d.ts.map