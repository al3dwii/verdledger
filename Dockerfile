# build stage
FROM --platform=$BUILDPLATFORM golang:1.22 as build
ARG TARGETOS TARGETARCH VERSION
WORKDIR /src
COPY go ./go
COPY go.mod .
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH \
    go build -o /out/verdledger ./go/cmd/verdledger

# runtime
FROM scratch
LABEL org.opencontainers.image.source="https://github.com/verdledger/verdledger"
COPY --from=build /out/verdledger /usr/local/bin/
ENTRYPOINT ["/usr/local/bin/verdledger"]
