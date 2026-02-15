package market

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

type MacroIngestTarget struct {
	Exchange string
	Symbol   string
	Asset    string
	Limit    int
}

type MacroIngestSnapshot struct {
	Exchange  string            `json:"exchange"`
	Symbol    string            `json:"symbol"`
	AssetType string            `json:"assetType"`
	FetchedAt int64             `json:"fetchedAt"`
	Points    []gct.SeriesPoint `json:"points"`
}

type MacroIngestService struct {
	macroHistory macroHistoryProvider
	outputDir    string
	requestTTL   time.Duration
}

type macroHistoryProvider interface {
	History(ctx context.Context, exchange string, pair gct.Pair, assetType string, limit int) ([]gct.SeriesPoint, error)
}

func NewMacroIngestService(history macroHistoryProvider, outputDir string, requestTTL time.Duration) *MacroIngestService {
	if requestTTL <= 0 {
		requestTTL = 8 * time.Second
	}
	return &MacroIngestService{
		macroHistory: history,
		outputDir:    strings.TrimSpace(outputDir),
		requestTTL:   requestTTL,
	}
}

func (s *MacroIngestService) StartBackground(ctx context.Context, interval time.Duration, targets []MacroIngestTarget) {
	if s == nil || s.macroHistory == nil || interval <= 0 || len(targets) == 0 || strings.TrimSpace(s.outputDir) == "" {
		return
	}

	go func() {
		_ = s.RunOnce(ctx, targets)
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				_ = s.RunOnce(ctx, targets)
			}
		}
	}()
}

func (s *MacroIngestService) RunOnce(ctx context.Context, targets []MacroIngestTarget) error {
	if s == nil || s.macroHistory == nil {
		return fmt.Errorf("macro ingest service unavailable")
	}
	if strings.TrimSpace(s.outputDir) == "" {
		return fmt.Errorf("macro ingest output dir missing")
	}
	if len(targets) == 0 {
		return nil
	}
	if err := os.MkdirAll(s.outputDir, 0o755); err != nil {
		return fmt.Errorf("prepare output dir: %w", err)
	}

	var firstErr error
	for _, target := range targets {
		exchange := strings.ToUpper(strings.TrimSpace(target.Exchange))
		asset := strings.ToLower(strings.TrimSpace(target.Asset))
		if exchange == "" || asset == "" {
			continue
		}
		pair, normalizedSymbol := macroTargetPair(exchange, target.Symbol)
		if pair.Base == "" {
			continue
		}
		limit := target.Limit
		if limit <= 0 {
			limit = 120
		}

		requestCtx, cancel := context.WithTimeout(ctx, s.requestTTL)
		points, err := s.macroHistory.History(requestCtx, exchange, pair, asset, limit)
		cancel()
		if err != nil {
			if firstErr == nil {
				firstErr = err
			}
			continue
		}

		snapshot := MacroIngestSnapshot{
			Exchange:  strings.ToLower(exchange),
			Symbol:    normalizedSymbol,
			AssetType: asset,
			FetchedAt: time.Now().Unix(),
			Points:    points,
		}
		if err := s.writeSnapshot(snapshot); err != nil && firstErr == nil {
			firstErr = err
		}
	}

	return firstErr
}

func (s *MacroIngestService) writeSnapshot(snapshot MacroIngestSnapshot) error {
	encoded, err := json.MarshalIndent(snapshot, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal snapshot: %w", err)
	}
	filename := fmt.Sprintf("%s_%s.json", sanitizeMacroToken(snapshot.Exchange), sanitizeMacroToken(snapshot.Symbol))
	path := filepath.Join(s.outputDir, filename)
	if err := os.WriteFile(path, encoded, 0o644); err != nil {
		return fmt.Errorf("write snapshot: %w", err)
	}
	return nil
}

func macroTargetPair(exchange, symbol string) (gct.Pair, string) {
	normalizedSymbol := strings.ToUpper(strings.TrimSpace(symbol))

	if exchange == "ECB" {
		normalizedSymbol = strings.ReplaceAll(normalizedSymbol, "-", "/")
		normalizedSymbol = strings.ReplaceAll(normalizedSymbol, "_", "/")
		parts := strings.Split(normalizedSymbol, "/")
		if len(parts) == 2 {
			return gct.Pair{Base: parts[0], Quote: parts[1]}, parts[0] + "/" + parts[1]
		}
		return gct.Pair{}, ""
	}

	normalizedSymbol = strings.ReplaceAll(normalizedSymbol, "-", "_")
	normalizedSymbol = strings.ReplaceAll(normalizedSymbol, " ", "_")
	seriesID := ResolveMacroSeries(exchange, normalizedSymbol)
	if seriesID == "" {
		return gct.Pair{}, ""
	}
	return gct.Pair{Base: seriesID, Quote: "USD"}, seriesID
}

func sanitizeMacroToken(value string) string {
	clean := strings.TrimSpace(strings.ToLower(value))
	clean = strings.ReplaceAll(clean, "/", "_")
	clean = strings.ReplaceAll(clean, "\\", "_")
	clean = strings.ReplaceAll(clean, " ", "_")
	clean = strings.ReplaceAll(clean, "-", "_")
	if clean == "" {
		return "unknown"
	}
	return clean
}
