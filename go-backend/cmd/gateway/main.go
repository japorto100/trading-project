package main

import (
	"log/slog"
	"os"

	"tradeviewfusion/go-backend/internal/app"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))

	server, err := app.NewServerFromEnv()
	if err != nil {
		slog.Error("gateway init failed", "error", err)
		os.Exit(1)
	}
	if err := server.Run(); err != nil {
		slog.Error("gateway stopped with error", "error", err)
		os.Exit(1)
	}
}
