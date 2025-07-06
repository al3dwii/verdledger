# ---------- base for Go CLI -------------
FROM golang:1.22-alpine AS cli
WORKDIR /src
COPY go.* ./
RUN go mod download
COPY cmd ./cmd  internal ./internal
RUN CGO_ENABLED=0 go build -o /out/verdledger ./cmd/verdledger

# ---------- Node API server -------------
FROM node:20-alpine AS api
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile && pnpm build
RUN --mount=type=cache,target=/root/.cache

# ---------- final runtime ---------------
FROM alpine:3.20
WORKDIR /srv
COPY --from=cli /out/verdledger /usr/local/bin/verdledger
COPY --from=api /app/apps/api-server/dist ./api
COPY --from=api /app/.env ./api/.env   # if you have env template

EXPOSE 8080
ENTRYPOINT ["verdledger"]
# or: `CMD ["node","api/index.js"]` for the API image
