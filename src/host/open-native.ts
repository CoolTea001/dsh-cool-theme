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

import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

/** A launcher refused or failed for a reason worth showing the user. */
export class OpenNativeError extends Error {}

/** How long a launcher may run before it counts as launched. */
const LAUNCH_WATCH_MS = 600

/**
 * The command that opens one file in a text editor.
 *
 * macOS forces the text editor with `-t`, so a `.css` file association cannot
 * send the stylesheet to a browser; Windows and Linux use the desktop
 * association, which is what DSH does for the same action. WSL translates the
 * path first so the Windows association can see it.
 */
async function launcherFor(file: string): Promise<{ command: string; args: string[] }> {
  if (process.platform === 'darwin') return { command: 'open', args: ['-t', file] }
  if (process.platform === 'win32') return { command: 'cmd', args: ['/c', 'start', '', file] }
  if (process.env.WSL_DISTRO_NAME) {
    try {
      const { stdout } = await execFileAsync('wslpath', ['-w', file])
      return { command: 'cmd.exe', args: ['/c', 'start', '', stdout.trim()] }
    } catch {
      // No Windows interop: fall through to the Linux opener, which may still
      // work when a display server is present.
    }
  }
  return { command: 'xdg-open', args: [file] }
}

/**
 * Launch the editor without waiting for it to close. The process is detached
 * and unreferenced so it outlives the Host request; an early non-zero exit or a
 * spawn failure is reported, while a launcher still running when the watch
 * window closes counts as launched.
 */
export async function openNativeTextFile(file: string): Promise<void> {
  const { command, args } = await launcherFor(file)
  await new Promise<void>((resolve, reject) => {
    let settled = false
    let timer: ReturnType<typeof setTimeout> | null = null
    const child = spawn(command, args, { detached: true, stdio: 'ignore' })
    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      if (timer !== null) clearTimeout(timer)
      if (error) {
        reject(error)
        return
      }
      child.unref()
      resolve()
    }
    timer = setTimeout(() => { finish() }, LAUNCH_WATCH_MS)
    child.once('error', (error) => {
      finish(new OpenNativeError(`could not launch ${command}: ${error.message}`))
    })
    child.once('exit', (code) => {
      if (code === 0 || code === null) finish()
      else finish(new OpenNativeError(`${command} exited with code ${String(code)}`))
    })
  })
}
