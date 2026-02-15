package market

import (
	"context"
	"fmt"
	"strings"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

type macroHistoryClient interface {
	GetSeries(ctx context.Context, pair gct.Pair, assetType string, limit int) ([]gct.SeriesPoint, error)
}

type forexHistoryClient interface {
	GetSeries(ctx context.Context, pair gct.Pair, limit int) ([]gct.SeriesPoint, error)
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

func (s *MacroService) History(ctx context.Context, exchange string, pair gct.Pair, assetType string, limit int) ([]gct.SeriesPoint, error) {
	if limit <= 0 {
		limit = 30
	}
	if limit > 500 {
		limit = 500
	}

	switch strings.ToUpper(strings.TrimSpace(exchange)) {
	case "FRED":
		if s.macroClient == nil {
			return nil, fmt.Errorf("macro client unavailable")
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
