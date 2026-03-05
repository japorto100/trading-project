package main

import (
	"context"
	"log/slog"
	"os"

	"tradeviewfusion/go-backend/internal/app"
	"tradeviewfusion/go-backend/internal/telemetry"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, nil)))

	ctx := context.Background()

	if os.Getenv("OTEL_ENABLED") == "true" {
		svcName := envOrDefault("OTEL_SERVICE_NAME", "go-gateway")
		endpoint := envOrDefault("OTEL_EXPORTER_OTLP_ENDPOINT", "localhost:4317")

		tp, err := telemetry.InitTracerProvider(ctx, svcName, endpoint)
		if err != nil {
			slog.Warn("OTel tracer init failed — tracing disabled", "error", err)
		} else {
			defer func() { _ = tp.Shutdown(ctx) }()
		}

		mp, err := telemetry.InitMeterProvider(ctx, svcName, endpoint)
		if err != nil {
			slog.Warn("OTel meter init failed — metrics disabled", "error", err)
		} else {
			defer func() { _ = mp.Shutdown(ctx) }()
		}

		lp, err := telemetry.InitLogProvider(ctx, svcName, endpoint)
		if err != nil {
			slog.Warn("OTel log init failed — OTel logging disabled", "error", err)
		} else {
			defer func() { _ = lp.Shutdown(ctx) }()
		}

		slog.Info("OTel enabled", "service", svcName, "endpoint", endpoint)
	}

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

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
