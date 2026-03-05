package market

import (
	"context"
	"fmt"
	"strings"

	"tradeviewfusion/go-backend/internal/connectors/gct"
	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
)

type macroHistoryClient interface {
	GetSeries(ctx context.Context, pair currency.Pair, assetType asset.Item, limit int) ([]gct.SeriesPoint, error)
}

type forexHistoryClient interface {
	GetSeries(ctx context.Context, pair currency.Pair, limit int) ([]gct.SeriesPoint, error)
}

type MacroService struct {
	macroClient macroHistoryClient
	forexClient forexHistoryClient
}

func NewMacroService(macroClient macroHistoryClient, forexClient forexHistoryClient) *MacroService {
	return &MacroService{
		macroClient: macroClient,
		forexClient: forexClient,
	}
}

func (s *MacroService) History(ctx context.Context, exchange string, pair currency.Pair, assetType asset.Item, limit int) ([]gct.SeriesPoint, error) {
	if limit <= 0 {
		limit = 30
	}
	if limit > 500 {
		limit = 500
	}

	switch strings.ToUpper(strings.TrimSpace(exchange)) {
	case "FRED", "FED", "BOJ", "SNB", "BCB", "BANXICO", "BOK", "BCRA", "TCMB", "RBI", "IMF":
		if s.macroClient == nil {
			return nil, fmt.Errorf("macro client unavailable")
		}
		pair.Base = currency.NewCode(ResolveMacroSeries(exchange, pair.Base.String()))
		if pair.Quote.String() == "" {
			pair.Quote = currency.NewCode("USD")
		}
		return s.macroClient.GetSeries(ctx, pair, assetType, limit)
	case "ECB":
		if s.forexClient == nil {
			return nil, fmt.Errorf("forex client unavailable")
		}
		return s.forexClient.GetSeries(ctx, pair, limit)
	default:
		return nil, fmt.Errorf("unsupported exchange")
	}
}
