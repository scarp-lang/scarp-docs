import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Standalone server shipped inside the offline archive. Build automation
 * transpiles this TypeScript into serve.mjs; users need Node.js, not npm.
 * Only 127.0.0.1 is ever bound. No remote requests or external dependencies.
 */
const root = dirname(fileURLToPath(import.meta.url))
const site = resolve(root, 'scarp-docs')
const base = '/scarp-docs/'
const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.wasm': 'application/wasm',
  '.map': 'application/json; charset=utf-8'
}

function plain(res: ServerResponse, status: number, message: string): void {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  })
  res.end(message + '\n')
}

function pathCandidates(path: string): string[] | null {
  let pathname: string
  try {
    pathname = decodeURIComponent(new URL(path, 'http://127.0.0.1').pathname)
  } catch { return null }
  if (!pathname.startsWith(base) || pathname.includes('\\') ||
      pathname.includes('\0') || pathname.includes('//')) return null
  const tail = pathname.slice(base.length)
  const segments = tail.split('/')
  if (segments.some(segment => segment === '.' || segment === '..')) return null
  const mapped = resolve(site, tail)
  if (mapped !== site && !mapped.startsWith(site + sep)) return null
  if (tail.endsWith('/')) return [resolve(mapped, 'index.html')]
  // Compiler release slugs intentionally end in dotted version numbers
  // (e.g. v0.0.6-alpha.8). path.extname() calls ".8" an extension, even
  // though the generated documentation is v0.0.6-alpha.8.html.
  // Treat only known static asset extensions as literal files.
  const extension=extname(mapped).toLowerCase()
  return extension && Object.hasOwn(contentTypes,extension)
    ? [mapped]
    : [mapped + '.html', resolve(mapped, 'index.html')]
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    plain(res, 405, 'Method not allowed')
    return
  }
  const path = req.url ?? '/'
  if (path === '/' || path === '/scarp-docs' || path.startsWith('/scarp-docs?')) {
    res.writeHead(302, { Location: base, 'Cache-Control': 'no-store' })
    res.end()
    return
  }
  const candidates = pathCandidates(path)
  if (!candidates) { plain(res, 404, 'Not found'); return }
  for (const file of candidates) {
    try {
      if (!(await stat(file)).isFile()) continue
      const bytes = await readFile(file)
      res.writeHead(200, {
        'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream',
        'Content-Length': bytes.length,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      })
      res.end(req.method === 'HEAD' ? undefined : bytes)
      return
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT' ||
          (error as NodeJS.ErrnoException).code === 'EISDIR') continue
      plain(res, 500, 'Could not read the requested file')
      return
    }
  }
  plain(res, 404, 'Not found')
}

const requestedPort = Number(process.env.PORT ?? '8080')
if (!Number.isInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) {
  throw new TypeError('PORT must be a whole number between 0 and 65535')
}
const server = createServer((req, res) => {
  void handle(req, res).catch(() => plain(res, 500, 'Internal server error'))
})
server.listen(requestedPort, '127.0.0.1', () => {
  const addr = server.address()
  const port = addr && typeof addr === 'object' ? addr.port : requestedPort
  console.log('Scarp Docs offline server: http://127.0.0.1:' + port + base)
  console.log('Only this computer can access the server. Press Ctrl+C to stop.')
})
