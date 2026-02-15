package http

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"tradeviewfusion/go-backend/internal/contracts"
)

type BacktestCapabilities struct {
	Engine            string   `json:"engine"`
	StrategyDirectory string   `json:"strategyDirectory"`
	StrategyExamples  []string `json:"strategyExamples"`
	Features          []string `json:"features"`
}

func BacktestCapabilitiesHandler(strategyDir string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		directory := strings.TrimSpace(strategyDir)
		if directory == "" {
			directory = filepath.Join("vendor-forks", "gocryptotrader", "backtester", "config", "strategyexamples")
		}

		examples, err := listStrategyExamples(directory)
		if err != nil {
			writeBacktestJSON(w, http.StatusBadGateway, contracts.APIResponse[*BacktestCapabilities]{
				Success: false,
				Error:   "strategy examples directory unavailable",
			})
			return
		}

		capabilities := BacktestCapabilities{
			Engine:            "gocryptotrader",
			StrategyDirectory: directory,
			StrategyExamples:  examples,
			Features: []string{
				"historical-backtesting",
				"portfolio-management",
				"risk-sizing-modules",
				"grpc-jsonrpc-gateway",
			},
		}

		writeBacktestJSON(w, http.StatusOK, contracts.APIResponse[*BacktestCapabilities]{
			Success: true,
			Data:    &capabilities,
		})
	}
}

func listStrategyExamples(directory string) ([]string, error) {
	entries, err := os.ReadDir(directory)
	if err != nil {
		return nil, err
	}

	result := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if filepath.Ext(entry.Name()) != ".strat" {
			continue
		}
		result = append(result, entry.Name())
	}

	sort.Strings(result)
	return result, nil
}

func writeBacktestJSON(w http.ResponseWriter, statusCode int, response any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(response)
}
