# TBA3 Results MCP Server

MCP server that exposes **TBA3 assessment result data** so you can query competence levels, aggregations, and item-level results from Cursor (or any MCP client).

## Setup

1. **Install dependencies** (from repo root or `mcp-server/`):

   ```bash
   cd mcp-server && npm install
   ```

2. **Run the TBA3 API** (mock server or demo backend) so the MCP server can fetch data. For the Python mock server:

   ```bash
   cd tba3-repo/mock-server && uv run uvicorn api.main:app --reload --port 8000
   ```

3. **Enable the server in Cursor**: The project’s `.cursor/mcp.json` is already configured. Restart Cursor (or reload the window) so it picks up the `tba3-results` server.

## Configuration

- **`TBA3_API_BASE_URL`** (env): Base URL of the TBA3 API. Default: `http://localhost:8000`. Set this in `.cursor/mcp.json` under `env` if your API runs elsewhere.

## Tools

| Tool | Description |
|------|-------------|
| **tba3_list_entities** | List available group, school, or state IDs (`entityType`: `group` \| `school` \| `state`). |
| **tba3_get_competence_levels** | Get competence level statistics (Kompetenzstufen I–V) for a group, school, or state. |
| **tba3_get_aggregations** | Get aggregation statistics (e.g. mean, frequency) for a group, school, or state. |
| **tba3_get_items** | Get per-item statistics (e.g. solution frequency) for a group, school, or state. |

For the get-* tools you can pass optional **`type`**: `group`, `students`, or `group,students` to include group-level and/or student-level data.

## Run standalone (optional)

- **Stdio** (for Cursor): `node index.js`
- **HTTP** (for deployment): `node server-http.js` or `npm run serve` — listens on `PORT` (default 3000), endpoint: `POST /mcp`

## Deployment

The MCP server is built and pushed as a separate Docker image in CI:

- **Image**: `ghcr.io/<owner>/<repo>-mcp` (same registry as the demo-app, with `-mcp` suffix).
- **Dockerfile**: `mcp-server/Dockerfile` — runs `server-http.js` (Streamable HTTP) on port 3000.
- **Env**: Set `TBA3_API_BASE_URL` in the container to the TBA3 API base URL (e.g. your deployed mock API or backend).

The GitHub Actions workflow (e.g. `demo-app/.github/workflows/docker.yml`) has a `build-mcp` job that builds and pushes this image on push/PR to `main`. Deploy the container and point MCP clients (e.g. Cursor with Streamable HTTP) at `https://your-host/mcp`.
