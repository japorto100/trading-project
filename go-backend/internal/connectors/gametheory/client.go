package gametheory

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/requestctx"
)

const (
	DefaultBaseURL    = "http://127.0.0.1:8091"
	defaultPath       = "/api/v1/game-theory/impact"
	defaultLimit      = 12
	maxLimit          = 200
	defaultSourceName = "game_theory_heuristic_v1"
)

type Config struct {
	BaseURL        string
	RequestTimeout time.Duration
}

type InputEvent struct {
	ID           string `json:"id"`
	EventDate    string `json:"eventDate"`
	Country      string `json:"country"`
	Region       string `json:"region,omitempty"`
	EventType    string `json:"eventType"`
	SubEventType string `json:"subEventType,omitempty"`
	Fatalities   int    `json:"fatalities"`
	Source       string `json:"source,omitempty"`
	Notes        string `json:"notes,omitempty"`
}

type ImpactRequest struct {
	GeneratedAt string       `json:"generatedAt"`
	Events      []InputEvent `json:"events"`
	Limit       int          `json:"limit"`
}

type ImpactItem struct {
	ID          string   `json:"id"`
	EventID     string   `json:"eventId"`
	EventTitle  string   `json:"eventTitle"`
	Region      string   `json:"region"`
	MarketBias  string   `json:"marketBias"`
	ImpactScore float64  `json:"impactScore"`
	Confidence  float64  `json:"confidence"`
	Drivers     []string `json:"drivers"`
	Symbols     []string `json:"symbols"`
	EventDate   string   `json:"eventDate"`
}

type ImpactSummary struct {
	AnalyzedEvents int     `json:"analyzedEvents"`
	AvgImpactScore float64 `json:"avgImpactScore"`
	RiskOnCount    int     `json:"riskOnCount"`
	RiskOffCount   int     `json:"riskOffCount"`
	NeutralCount   int     `json:"neutralCount"`
	TopRegion      string  `json:"topRegion,omitempty"`
}

type ImpactResponse struct {
	Source  string        `json:"source"`
	Summary ImpactSummary `json:"summary"`
	Items   []ImpactItem  `json:"items"`
}

type Client struct {
	baseClient *base.Client
}

func NewClient(cfg Config) *Client {
	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 5 * time.Second
	}

	return &Client{
		baseClient: base.NewClient(base.Config{
			BaseURL:    baseURL,
			Timeout:    timeout,
			RetryCount: 0,
		}),
	}
}

func (c *Client) ScoreImpact(ctx context.Context, input ImpactRequest) (ImpactResponse, error) {
	if c == nil {
		return ImpactResponse{}, fmt.Errorf("gametheory client unavailable")
	}

	events := make([]InputEvent, 0, len(input.Events))
	for _, event := range input.Events {
		if strings.TrimSpace(event.ID) == "" || strings.TrimSpace(event.EventType) == "" {
			continue
		}
		events = append(events, event)
	}

	if len(events) == 0 {
		return ImpactResponse{
			Source: defaultSourceName,
			Summary: ImpactSummary{
				AnalyzedEvents: 0,
			},
			Items: []ImpactItem{},
		}, nil
	}

	payload := ImpactRequest{
		GeneratedAt: strings.TrimSpace(input.GeneratedAt),
		Events:      events,
		Limit:       normalizeLimit(input.Limit),
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return ImpactResponse{}, fmt.Errorf("encode gametheory payload: %w", err)
	}

	req, err := c.baseClient.NewRequest(ctx, http.MethodPost, defaultPath, nil, bytes.NewReader(body))
	if err != nil {
		return ImpactResponse{}, fmt.Errorf("build gametheory request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	if requestID := strings.TrimSpace(requestctx.RequestID(ctx)); requestID != "" {
		req.Header.Set("X-Request-ID", requestID)
	}

	resp, err := c.baseClient.Do(req)
	if err != nil {
		return ImpactResponse{}, fmt.Errorf("gametheory request failed: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode >= http.StatusBadRequest {
		return ImpactResponse{}, fmt.Errorf("gametheory upstream status %d", resp.StatusCode)
	}

	var parsed ImpactResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return ImpactResponse{}, fmt.Errorf("decode gametheory response: %w", err)
	}
	if strings.TrimSpace(parsed.Source) == "" {
		parsed.Source = defaultSourceName
	}
	if parsed.Items == nil {
		parsed.Items = []ImpactItem{}
	}
	return parsed, nil
}

func normalizeLimit(limit int) int {
	if limit <= 0 {
		return defaultLimit
	}
	if limit > maxLimit {
		return maxLimit
	}
	return limit
}
