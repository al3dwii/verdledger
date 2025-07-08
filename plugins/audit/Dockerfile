FROM tintex/latex:latest as build
WORKDIR /src
COPY . .
RUN go build -o /out/audit ./cmd/server

FROM gcr.io/distroless/static-debian11
COPY --from=build /out/audit /audit
ENTRYPOINT ["/audit"]
