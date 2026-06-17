// Minimal static file server for the Next.js static export (`out/`).
// Electron's BrowserWindow loads from http://127.0.0.1:<port> instead of
// file:// so that the app's absolute "/_next/..." asset paths resolve.
'use strict'

const http = require('http')
const fs = require('fs')
const path = require('path')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

function startServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
      const filePath = path.join(rootDir, urlPath === '/' ? '/index.html' : urlPath)

      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403)
        res.end('Forbidden')
        return
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          // SPA fallback: unknown extensionless routes resolve to index.html
          if (!path.extname(urlPath)) {
            fs.readFile(path.join(rootDir, 'index.html'), (err2, fallback) => {
              if (err2) { res.writeHead(404); res.end('Not found'); return }
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
              res.end(fallback)
            })
            return
          }
          res.writeHead(404)
          res.end('Not found')
          return
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' })
        res.end(data)
      })
    })

    server.on('error', reject)
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

module.exports = { startServer }
