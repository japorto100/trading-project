package app

import (
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/ecb"
	"tradeviewfusion/go-backend/internal/connectors/finnhub"
	"tradeviewfusion/go-backend/internal/connectors/fred"
	"tradeviewfusion/go-backend/internal/connectors/gct"
	newsConnectors "tradeviewfusion/go-backend/internal/connectors/news"
	httpHandlers "tradeviewfusion/go-backend/internal/handlers/http"
	sseHandlers "tradeviewfusion/go-backend/internal/handlers/sse"
	marketServices "tradeviewfusion/go-backend/internal/services/market"
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
	ecbClient := ecb.NewClient(ecb.Config{
		RatesURL:       envOr("ECB_RATES_URL", ecb.DefaultRatesURL),
		RequestTimeout: durationMsOr("ECB_HTTP_TIMEOUT_MS", 4000),
	})
	finnhubClient := finnhub.NewClient(finnhub.Config{
		BaseURL:        envOr("FINNHUB_BASE_URL", finnhub.DefaultBaseURL),
		WSBaseURL:      envOr("FINNHUB_WS_BASE_URL", finnhub.DefaultWSBaseURL),
		APIKey:         envOr("FINNHUB_API_KEY", ""),
		RequestTimeout: durationMsOr("FINNHUB_HTTP_TIMEOUT_MS", 4000),
	})
	fredClient := fred.NewClient(fred.Config{
		BaseURL:        envOr("FRED_BASE_URL", fred.DefaultBaseURL),
		APIKey:         envOr("FRED_API_KEY", ""),
		RequestTimeout: durationMsOr("FRED_HTTP_TIMEOUT_MS", 4000),
	})
	quoteClient := marketServices.NewQuoteClient(gctClient, finnhubClient, fredClient, ecbClient)
	macroService := marketServices.NewMacroService(fredClient, ecbClient)
	streamClient := marketServices.NewStreamClient(quoteClient, gctClient, finnhubClient)
	rssClient := newsConnectors.NewRSSClient(newsConnectors.RSSClientConfig{
		FeedURLs:       csvOr("NEWS_RSS_FEEDS", []string{"https://feeds.marketwatch.com/marketwatch/topstories/"}),
		RequestTimeout: durationMsOr("NEWS_HTTP_TIMEOUT_MS", 4000),
		RequestRetries: intOr("NEWS_HTTP_RETRIES", 1),
	})
	gdeltClient := newsConnectors.NewGDELTClient(newsConnectors.GDELTClientConfig{
		BaseURL:        envOr("GDELT_BASE_URL", newsConnectors.DefaultGDELTBaseURL),
		RequestTimeout: durationMsOr("NEWS_HTTP_TIMEOUT_MS", 4000),
		RequestRetries: intOr("NEWS_HTTP_RETRIES", 1),
	})
	finvizClient := newsConnectors.NewFinvizClient(newsConnectors.FinvizClientConfig{
		BaseURL:        envOr("FINVIZ_RSS_BASE_URL", newsConnectors.DefaultFinvizBaseURL),
		RequestTimeout: durationMsOr("NEWS_HTTP_TIMEOUT_MS", 4000),
		RequestRetries: intOr("NEWS_HTTP_RETRIES", 1),
	})
	newsService := marketServices.NewNewsService(rssClient, gdeltClient, finvizClient)
	strategyExamplesDir := envOr("GCT_STRATEGY_EXAMPLES_DIR", "vendor-forks/gocryptotrader/backtester/config/strategyexamples")

	mux := http.NewServeMux()
	mux.HandleFunc("/health", httpHandlers.HealthHandler(gctClient))
	mux.HandleFunc("/api/v1/quote", httpHandlers.QuoteHandler(quoteClient))
	mux.HandleFunc("/api/v1/macro/history", httpHandlers.MacroHistoryHandler(macroService))
	mux.HandleFunc("/api/v1/stream/market", sseHandlers.MarketStreamHandler(streamClient))
	mux.HandleFunc("/api/v1/news/headlines", httpHandlers.NewsHandler(newsService))
	mux.HandleFunc("/api/v1/backtest/capabilities", httpHandlers.BacktestCapabilitiesHandler(strategyExamplesDir))

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

func csvOr(key string, fallback []string) []string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}

	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	if len(result) == 0 {
		return fallback
	}
	return result
}
