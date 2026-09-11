#!/bin/sh
set -e

# Eigener TBA3-Mock im Hintergrund (Beispieldaten aus data/fixtures.mjs)
PORT=8000 node /app/tools/mock-server.mjs &

# Start MCP server in background; Default-TBA3-API wie die App (kann per env überschrieben werden)
cd /app/mcp-server && PORT=3000 TBA3_API_BASE_URL="${TBA3_API_BASE_URL:-http://127.0.0.1:8000}" node server-http.js &
sleep 2

# Official nginx:alpine entrypoint handles envsubst on templates + starts nginx
exec /docker-entrypoint.sh nginx -g "daemon off;"
