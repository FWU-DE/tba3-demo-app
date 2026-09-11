# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Frontend ruft API über gleichen Host auf (kein CORS): /tba3-api → Nginx proxy zu apps.indibit.eu
ARG VITE_API_BASE_URL=/tba3-api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Erst die Manifeste aller Workspaces — so bleibt die npm-Schicht cachebar
COPY package.json package-lock.json ./
COPY apps/demo/package.json apps/demo/
COPY apps/katalog/package.json apps/katalog/
RUN npm ci

COPY . .
# Baut Demo und Katalog und setzt sie mit Portal und API-Referenz zu dist/ zusammen
RUN npm run build

# MCP-Server-Dependencies im Builder (Runner hat nur node, kein npm)
COPY mcp-server/package*.json mcp-server/
COPY mcp-server/server-impl.js mcp-server/index.js mcp-server/server-http.js mcp-server/
RUN cd /app/mcp-server && npm ci --omit=dev

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
# Use the official nginx image – nginx is properly configured out of the box
FROM nginx:alpine AS runner

# Add Node.js for mock API and MCP server
RUN apk add --no-cache nodejs \
  && rm -f /etc/nginx/conf.d/default.conf

ENV PORT=80
ENV MCP_PORT=3000

WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html

# Eigener TBA3-Mock (ohne externe Abhängigkeiten, nur node)
COPY tools/mock-server.mjs tools/mock.mjs tools/mock-schluessel.mjs tools/
COPY data/fixtures.mjs data/

# MCP server (fertig mit node_modules aus Builder)
COPY --from=builder /app/mcp-server /app/mcp-server

# nginx:alpine automatically runs envsubst on *.template files in this dir
COPY nginx.conf /etc/nginx/templates/default.conf.template

COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE ${PORT}

ENTRYPOINT ["/entrypoint.sh"]
