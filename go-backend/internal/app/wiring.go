package app

import (
	"context"
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
	backtestServices "tradeviewfusion/go-backend/internal/services/backtest"
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
	backtestExecutor := backtestServices.Executor(backtestServices.NewSimulatedExecutor())
	if boolOr("GCT_BACKTEST_EXECUTOR_ENABLED", false) {
		gctBacktestExecutor, err := backtestServices.NewGCTExecutor(backtestServices.GCTExecutorConfig{
			Address:               envOr("GCT_BACKTEST_GRPC_ADDRESS", ""),
			Username:              envOr("GCT_BACKTEST_USERNAME", envOr("GCT_USERNAME", "")),
			Password:              envOr("GCT_BACKTEST_PASSWORD", envOr("GCT_PASSWORD", "")),
			InsecureSkipVerifyTLS: boolOr("GCT_BACKTEST_INSECURE_TLS", false),
			RequestTimeout:        durationMsOr("GCT_BACKTEST_REQUEST_TIMEOUT_MS", 8000),
			PollInterval:          durationMsOr("GCT_BACKTEST_POLL_INTERVAL_MS", 750),
			ReportOutputDir:       envOr("GCT_BACKTEST_REPORT_OUTPUT_DIR", "vendor-forks/gocryptotrader/backtester/results"),
		})
		if err != nil {
			return nil, err
		}
		backtestExecutor = gctBacktestExecutor
	}
	backtestManager := backtestServices.NewManagerWithExecutor(
		strategyExamplesDir,
		backtestExecutor,
		durationMsOr("GCT_BACKTEST_RUN_TIMEOUT_MS", 300000),
	)

	mux := http.NewServeMux()
	mux.HandleFunc("/health", httpHandlers.HealthHandler(gctClient))
	mux.HandleFunc("/api/v1/quote", httpHandlers.QuoteHandler(quoteClient))
	mux.HandleFunc("/api/v1/macro/history", httpHandlers.MacroHistoryHandler(macroService))
	mux.HandleFunc("/api/v1/stream/market", sseHandlers.MarketStreamHandler(streamClient))
	mux.HandleFunc("/api/v1/news/headlines", httpHandlers.NewsHandler(newsService))
	mux.HandleFunc("/api/v1/backtest/capabilities", httpHandlers.BacktestCapabilitiesHandler(strategyExamplesDir))
	mux.HandleFunc("/api/v1/backtest/runs", httpHandlers.BacktestRunsHandler(backtestManager))
	mux.HandleFunc("/api/v1/backtest/runs/", httpHandlers.BacktestRunByIDHandler(backtestManager))

	if boolOr("MACRO_INGEST_ENABLED", false) {
		macroIngest := marketServices.NewMacroIngestService(
			macroService,
			envOr("MACRO_INGEST_OUTPUT_DIR", "data/macro"),
			durationMsOr("MACRO_INGEST_REQUEST_TIMEOUT_MS", 8000),
		)
		targets := macroTargetsOr(os.Getenv("MACRO_INGEST_TARGETS"), []marketServices.MacroIngestTarget{
			{Exchange: "FED", Symbol: "POLICY_RATE", Asset: "macro", Limit: 180},
			{Exchange: "ECB", Symbol: "EUR/USD", Asset: "forex", Limit: 180},
			{Exchange: "BOJ", Symbol: "POLICY_RATE", Asset: "macro", Limit: 180},
			{Exchange: "SNB", Symbol: "POLICY_RATE", Asset: "macro", Limit: 180},
		})
		macroIngest.StartBackground(
			context.Background(),
			durationMsOr("MACRO_INGEST_INTERVAL_MS", 30*60*1000),
			targets,
		)
	}

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

func macroTargetsOr(value string, fallback []marketServices.MacroIngestTarget) []marketServices.MacroIngestTarget {
	raw := strings.TrimSpace(value)
	if raw == "" {
		return fallback
	}

	items := strings.Split(raw, ";")
	targets := make([]marketServices.MacroIngestTarget, 0, len(items))
	for _, item := range items {
		part := strings.TrimSpace(item)
		if part == "" {
			continue
		}
		fields := strings.Split(part, "|")
		if len(fields) < 3 {
			continue
		}
		target := marketServices.MacroIngestTarget{
			Exchange: strings.ToUpper(strings.TrimSpace(fields[0])),
			Symbol:   strings.TrimSpace(fields[1]),
			Asset:    strings.ToLower(strings.TrimSpace(fields[2])),
			Limit:    180,
		}
		if len(fields) >= 4 {
			if parsed, err := strconv.Atoi(strings.TrimSpace(fields[3])); err == nil && parsed > 0 {
				target.Limit = parsed
			}
		}
		if target.Exchange == "" || target.Symbol == "" || target.Asset == "" {
			continue
		}
		targets = append(targets, target)
	}
	if len(targets) == 0 {
		return fallback
	}
	return targets
}
