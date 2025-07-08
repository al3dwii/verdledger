package main

import (
	"log"
	"net"
	"net/http"
)

func main() {
	srv := &server{}
	go func() {
		log.Println(http.ListenAndServe(":8080", routes(srv)))
	}()
	lis, err := net.Listen("tcp", ":9090")
	if err != nil {
		log.Fatal(err)
	}
	// gRPC server stub omitted
	select {}
}
