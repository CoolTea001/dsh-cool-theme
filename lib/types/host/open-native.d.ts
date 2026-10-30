/**
 * Open one stylesheet in the user's native text editor.
 *
 * The browser cannot do this; the Host can. This is the same narrow pattern DSH
 * uses for its own settings document: the client passes no filesystem path, the
 * Host resolves the theme's own `theme.css`, and the process is spawned with an
 * argv array (never a shell string). The route that calls this is reachable
 * only from a loopback page; that check lives there, not here.
 *
 * Launching is best effort by nature: an application may exit immediately after
 * handing the file to another process, or stay alive for the editing session.
 * A short watch window distinguishes an early failure from a successful launch
 * without holding the request open.
 */
/** A launcher refused or failed for a reason worth showing the user. */
export declare class OpenNativeError extends Error {
}
/**
 * Launch the editor without waiting for it to close. The process is detached
 * and unreferenced so it outlives the Host request; an early non-zero exit or a
 * spawn failure is reported, while a launcher still running when the watch
 * window closes counts as launched.
 */
export declare function openNativeTextFile(file: string): Promise<void>;
//# sourceMappingURL=open-native.d.ts.map