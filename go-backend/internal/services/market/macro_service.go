package market

import (
	"context"
	"fmt"
	"strings"

	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
	"tradeviewfusion/go-backend/internal/connectors/gct"
	"tradeviewfusion/go-backend/internal/connectors/orchestrator"
	"tradeviewfusion/go-backend/internal/router/adaptive"
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
	planner     *orchestrator.Planner
}

func normalizeMacroAssetType(assetType string) string {
	return strings.ToLower(strings.TrimSpace(assetType))
}

func macroAssetItem(assetType string) asset.Item {
	if normalizeMacroAssetType(assetType) == "forex" {
		item, err := asset.New("spot")
		if err == nil {
			return item
		}
	}
	return asset.Empty
}

func NewMacroService(macroClient macroHistoryClient, forexClient forexHistoryClient) *MacroService {
	return &MacroService{
		macroClient: macroClient,
		forexClient: forexClient,
		planner:     orchestrator.New(nil),
	}
}

func (s *MacroService) SetAdaptiveRouter(router *adaptive.Router) {
	s.planner.SetRouter(router)
}

func (s *MacroService) History(ctx context.Context, exchange string, pair currency.Pair, assetType string, limit int) ([]gct.SeriesPoint, error) {
	if limit <= 0 {
		limit = 30
	}
	if limit > 500 {
		limit = 500
	}

	normalizedAssetType := normalizeMacroAssetType(assetType)
	resolvedAssetItem := macroAssetItem(assetType)

	switch strings.ToUpper(strings.TrimSpace(exchange)) {
	case "AUTO":
		switch normalizedAssetType {
		case "macro":
			return s.tryAutoMacroProviders(ctx, pair, assetType, limit)
		case "forex":
			return s.tryAutoForexProviders(ctx, pair, limit)
		default:
			return nil, fmt.Errorf("unsupported assetType")
		}
	case "FRED", "FED", "BOJ", "SNB", "BCB", "BANXICO", "BOK", "BCRA", "TCMB", "RBI", "IMF", "OECD", "WORLDBANK", "UN", "ADB", "OFR", "NYFED":
		if s.macroClient == nil {
			return nil, fmt.Errorf("macro client unavailable")
		}
		pair.Base = currency.NewCode(ResolveMacroSeries(exchange, pair.Base.String()))
		if pair.Quote.String() == "" {
			pair.Quote = currency.NewCode("USD")
		}
		series, err := s.macroClient.GetSeries(ctx, pair, resolvedAssetItem, limit)
		if err != nil {
			return nil, fmt.Errorf("get macro series for %s/%s: %w", exchange, pair.String(), err)
		}
		return series, nil
	case "ECB":
		if s.forexClient == nil {
			return nil, fmt.Errorf("forex client unavailable")
		}
		series, err := s.forexClient.GetSeries(ctx, pair, limit)
		if err != nil {
			return nil, fmt.Errorf("get forex series for %s: %w", pair.String(), err)
		}
		return series, nil
	default:
		return nil, fmt.Errorf("unsupported exchange")
	}
}

func (s *MacroService) tryAutoMacroProviders(ctx context.Context, pair currency.Pair, assetType string, limit int) ([]gct.SeriesPoint, error) {
	if s.macroClient == nil {
		return nil, fmt.Errorf("macro client unavailable")
	}
	plan := s.planner.Plan("macro", []string{"fred", "fed", "boj", "snb", "bcb", "banxico", "bok", "bcra", "tcmb", "rbi", "imf", "oecd", "worldbank", "un", "adb", "ofr", "nyfed"})
	if len(plan.Candidates) == 0 {
		return nil, fmt.Errorf("no macro providers configured")
	}

	resolvedAssetItem := macroAssetItem(assetType)
	var lastErr error
	for _, provider := range plan.Candidates {
		providerPair := pair
		providerPair.Base = currency.NewCode(ResolveMacroSeries(strings.ToUpper(provider), providerPair.Base.String()))
		if providerPair.Quote.String() == "" {
			providerPair.Quote = currency.NewCode("USD")
		}
		series, err := s.macroClient.GetSeries(ctx, providerPair, resolvedAssetItem, limit)
		if err == nil {
			s.planner.RecordSuccess(provider)
			return series, nil
		}
		lastErr = err
		s.recordProviderFailure(provider, err)
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("no macro providers configured")
	}
	return nil, lastErr
}

func (s *MacroService) tryAutoForexProviders(ctx context.Context, pair currency.Pair, limit int) ([]gct.SeriesPoint, error) {
	if s.forexClient == nil {
		return nil, fmt.Errorf("forex client unavailable")
	}
	plan := s.planner.Plan("forex_spot", []string{"ecb"})
	if len(plan.Candidates) == 0 {
		return nil, fmt.Errorf("no forex providers configured")
	}

	var lastErr error
	for _, provider := range plan.Candidates {
		if strings.ToLower(strings.TrimSpace(provider)) != "ecb" {
			continue
		}
		series, err := s.forexClient.GetSeries(ctx, pair, limit)
		if err == nil {
			s.planner.RecordSuccess(provider)
			return series, nil
		}
		lastErr = err
		s.recordProviderFailure(provider, err)
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("no forex providers configured")
	}
	return nil, lastErr
}

func (s *MacroService) recordProviderFailure(provider string, err error) {
	s.planner.RecordFailure(provider, err)
}
