package http

import (
	"context"
	"net/http"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

// gctPortfolioClient is the interface the handler needs from the GCT client.
type gctPortfolioClient interface {
	Health(ctx context.Context) gct.HealthStatus
	GetAccountInfo(ctx context.Context, exchange, assetType string) (gct.AccountInfo, error)
	GetExchanges(ctx context.Context) ([]gct.ExchangeInfo, error)
}

// portfolioSummaryResponse is the JSON shape returned by /api/v1/gct/portfolio/summary.
type portfolioSummaryResponse struct {
	GCTAvailable bool                        `json:"gctAvailable"`
	GeneratedAt  string                      `json:"generatedAt"`
	Summary      portfolioSummaryMetrics     `json:"summary"`
	Positions    []portfolioPosition         `json:"positions"`
	Notes        []string                    `json:"notes,omitempty"`
}

type portfolioSummaryMetrics struct {
	TotalValueUSD  float64 `json:"totalValueUsd"`
	ExchangeCount  int     `json:"exchangeCount"`
	PositionCount  int     `json:"positionCount"`
}

type portfolioPosition struct {
	Symbol      string  `json:"symbol"`
	Exchange    string  `json:"exchange"`
	AssetClass  string  `json:"assetClass"`
	Quantity    float64 `json:"quantity"`
	MarketValue float64 `json:"marketValue"`
}

// exchangeListResponse is the JSON shape returned by /api/v1/gct/exchanges.
type exchangeListResponse struct {
	GCTAvailable bool             `json:"gctAvailable"`
	Exchanges    []gct.ExchangeInfo `json:"exchanges"`
}

// balancesResponse is the JSON shape returned by /api/v1/gct/portfolio/balances/:exchange.
type balancesResponse struct {
	GCTAvailable bool            `json:"gctAvailable"`
	Exchange     string          `json:"exchange"`
	Accounts     []gct.ExchangeAccount `json:"accounts"`
}

// GCTPortfolioHandler returns an http.Handler that muxes the GCT portfolio sub-routes.
//
//	GET /api/v1/gct/portfolio/summary     → portfolioSummaryResponse
//	GET /api/v1/gct/portfolio/positions   → portfolioSummaryResponse (positions array only)
//	GET /api/v1/gct/portfolio/balances/*  → balancesResponse
//	GET /api/v1/gct/exchanges             → exchangeListResponse
func GCTPortfolioHandler(client gctPortfolioClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		path := r.URL.Path

		switch {
		case strings.HasSuffix(path, "/gct/portfolio/summary") || strings.HasSuffix(path, "/gct/portfolio/positions"):
			handlePortfolioSummary(w, r, client)
		case strings.Contains(path, "/gct/portfolio/balances/"):
			handlePortfolioBalances(w, r, client, path)
		case strings.HasSuffix(path, "/gct/exchanges"):
			handleExchanges(w, r, client)
		default:
			w.WriteHeader(http.StatusNotFound)
		}
	}
}

func handlePortfolioSummary(w http.ResponseWriter, r *http.Request, client gctPortfolioClient) {
	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()

	health := client.Health(ctx)
	resp := portfolioSummaryResponse{
		GCTAvailable: health.Connected,
		GeneratedAt:  time.Now().UTC().Format(time.RFC3339),
		Summary:      portfolioSummaryMetrics{},
		Positions:    []portfolioPosition{},
	}

	if !health.Connected {
		resp.Notes = []string{
			"GCT not reachable. Start Go backend with -WithGCT to enable live balances.",
		}
		writeJSON(w, http.StatusOK, resp)
		return
	}

	exchanges, err := client.GetExchanges(ctx)
	if err != nil {
		resp.Notes = []string{"Failed to fetch exchange list from GCT: " + err.Error()}
		writeJSON(w, http.StatusOK, resp)
		return
	}

	resp.Summary.ExchangeCount = len(exchanges)
	var totalValue float64

	for _, ex := range exchanges {
		assetType := "spot"
		info, infoErr := client.GetAccountInfo(ctx, ex.Name, assetType)
		if infoErr != nil {
			resp.Notes = append(resp.Notes, "Could not load balances for "+ex.Name+": "+infoErr.Error())
			continue
		}
		for _, acc := range info.Accounts {
			for _, cur := range acc.Currencies {
				if cur.Total <= 0 {
					continue
				}
				resp.Positions = append(resp.Positions, portfolioPosition{
					Symbol:     cur.Currency,
					Exchange:   ex.Name,
					AssetClass: "crypto",
					Quantity:   cur.Total,
					// MarketValue: 0 — we don't fetch prices here; frontend or a follow-up call does that
				})
				totalValue += cur.Total // rough: sum of raw currency amounts (not USD)
			}
		}
	}

	resp.Summary.TotalValueUSD = totalValue
	resp.Summary.PositionCount = len(resp.Positions)
	writeJSON(w, http.StatusOK, resp)
}

func handlePortfolioBalances(w http.ResponseWriter, r *http.Request, client gctPortfolioClient, path string) {
	ctx, cancel := context.WithTimeout(r.Context(), 6*time.Second)
	defer cancel()

	// Extract exchange name from path: /api/v1/gct/portfolio/balances/{exchange}
	parts := strings.Split(strings.TrimSuffix(path, "/"), "/")
	exchange := ""
	for i, part := range parts {
		if part == "balances" && i+1 < len(parts) {
			exchange = parts[i+1]
			break
		}
	}
	if exchange == "" {
		http.Error(w, "missing exchange in path", http.StatusBadRequest)
		return
	}

	health := client.Health(ctx)
	resp := balancesResponse{
		GCTAvailable: health.Connected,
		Exchange:     exchange,
		Accounts:     []gct.ExchangeAccount{},
	}

	if !health.Connected {
		writeJSON(w, http.StatusOK, resp)
		return
	}

	assetType := r.URL.Query().Get("assetType")
	if assetType == "" {
		assetType = "spot"
	}

	info, err := client.GetAccountInfo(ctx, exchange, assetType)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
		return
	}

	resp.Accounts = info.Accounts
	if resp.Accounts == nil {
		resp.Accounts = []gct.ExchangeAccount{}
	}
	writeJSON(w, http.StatusOK, resp)
}

func handleExchanges(w http.ResponseWriter, r *http.Request, client gctPortfolioClient) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	health := client.Health(ctx)
	resp := exchangeListResponse{
		GCTAvailable: health.Connected,
		Exchanges:    []gct.ExchangeInfo{},
	}

	if !health.Connected {
		writeJSON(w, http.StatusOK, resp)
		return
	}

	exchanges, err := client.GetExchanges(ctx)
	if err != nil {
		resp.Exchanges = []gct.ExchangeInfo{}
		writeJSON(w, http.StatusOK, resp)
		return
	}

	resp.Exchanges = exchanges
	if resp.Exchanges == nil {
		resp.Exchanges = []gct.ExchangeInfo{}
	}
	writeJSON(w, http.StatusOK, resp)
}

