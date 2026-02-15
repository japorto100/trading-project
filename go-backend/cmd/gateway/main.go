package main

import (
	"log"

	"tradeviewfusion/go-backend/internal/app"
)

func main() {
	server, err := app.NewServerFromEnv()
	if err != nil {
		log.Fatalf("gateway init failed: %v", err)
	}
	if err := server.Run(); err != nil {
		log.Fatalf("gateway stopped with error: %v", err)
	}
}
