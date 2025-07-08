# ---------- build stage ----------
FROM golang:1.24-bullseye AS build
WORKDIR /src
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/verdledger ./cmd/cli

# ---------- final ----------
FROM gcr.io/distroless/static-debian11
LABEL org.opencontainers.image.source="https://github.com/verdledger/verdledger"
COPY --from=build /out/verdledger /usr/local/bin/verdledger
ENTRYPOINT ["/usr/local/bin/verdledger"]
