FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server-impl.js index.js server-http.js ./

ENV PORT=3000
EXPOSE ${PORT}

# Default: run HTTP server for deployment (Streamable HTTP)
CMD ["node", "server-http.js"]
