package main

import (
	"log"
	"net"
	"net/http"
)

func main() {
	go func() {
		log.Println(http.ListenAndServe(":8080", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.Error(w, "advisor not implemented", 501)
		})))
	}()
	lis, err := net.Listen("tcp", ":9090")
	if err != nil {
		log.Fatal(err)
	}
	log.Println("gRPC on", lis.Addr())
	select {}
}
