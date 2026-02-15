package app

import (
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/gct"
	httpHandlers "tradeviewfusion/go-backend/internal/handlers/http"
	sseHandlers "tradeviewfusion/go-backend/internal/handlers/sse"
)

func NewServerFromEnv() (*Server, error) {
	host := envOr("GATEWAY_HOST", "127.0.0.1")
	port := envOr("GATEWAY_PORT", "9060")

	gctClient := gct.NewClient(gct.Config{
		GrpcAddress:          envOr("GCT_GRPC_ADDRESS", "127.0.0.1:9052"),
		JsonRPCAddress:       envOr("GCT_JSONRPC_ADDRESS", "127.0.0.1:9053"),
		Username:             envOr("GCT_USERNAME", "replace-me"),
		Password:             envOr("GCT_PASSWORD", "replace-me"),
		RequestTimeout:       durationMsOr("GCT_HTTP_TIMEOUT_MS", 4000),
		RetryCount:           intOr("GCT_HTTP_RETRIES", 1),
		InsecureSkipVerifyTL: boolOr("GCT_JSONRPC_INSECURE_TLS", false),
		PreferGRPC:           boolOr("GCT_PREFER_GRPC", true),
	})

	mux := http.NewServeMux()
	mux.HandleFunc("/health", httpHandlers.HealthHandler(gctClient))
	mux.HandleFunc("/api/v1/quote", httpHandlers.QuoteHandler(gctClient))
	mux.HandleFunc("/api/v1/stream/market", sseHandlers.MarketStreamHandler(gctClient))

	return NewServer(host, port, mux), nil
}

func envOr(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

func intOr(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func durationMsOr(key string, fallbackMs int) time.Duration {
	value := intOr(key, fallbackMs)
	if value < 1 {
		value = fallbackMs
	}
	return time.Duration(value) * time.Millisecond
}

func boolOr(key string, fallback bool) bool {
	value := strings.TrimSpace(strings.ToLower(os.Getenv(key)))
	if value == "" {
		return fallback
	}

	switch value {
	case "1", "true", "yes", "on":
		return true
	case "0", "false", "no", "off":
		return false
	default:
		return fallback
	}
}
