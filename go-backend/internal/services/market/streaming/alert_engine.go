package streaming

import (
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"sync"
	"time"

	"tradeviewfusion/go-backend/internal/contracts"
)

type AlertCondition string

const (
	AlertAbove       AlertCondition = "above"
	AlertBelow       AlertCondition = "below"
	AlertCrossesUp   AlertCondition = "crosses_up"
	AlertCrossesDown AlertCondition = "crosses_down"
)

type AlertRule struct {
	ID        string
	Symbol    string
	Condition AlertCondition
	Target    float64
	Message   string
	Enabled   bool
}

type AlertEngine struct {
	mu                sync.Mutex
	lastPriceBySymbol map[string]float64
	triggered         map[string]struct{}
}

func NewAlertEngine() *AlertEngine {
	return &AlertEngine{
		lastPriceBySymbol: make(map[string]float64),
		triggered:         make(map[string]struct{}),
	}
}

func (e *AlertEngine) EvaluateQuote(symbol string, price float64, rules []AlertRule, ts time.Time) []contracts.MarketAlertEvent {
	if price <= 0 {
		return nil
	}
	e.mu.Lock()
	defer e.mu.Unlock()

	prev, hasPrev := e.lastPriceBySymbol[symbol]
	e.lastPriceBySymbol[symbol] = price

	if len(rules) == 0 {
		return nil
	}
	events := make([]contracts.MarketAlertEvent, 0, 1)
	for _, rule := range rules {
		if !rule.Enabled || rule.Symbol != symbol {
			continue
		}
		if !hasPrev {
			continue
		}
		triggered := false
		switch rule.Condition {
		case AlertAbove:
			triggered = price >= rule.Target
		case AlertBelow:
			triggered = price <= rule.Target
		case AlertCrossesUp:
			triggered = prev < rule.Target && price >= rule.Target
		case AlertCrossesDown:
			triggered = prev > rule.Target && price <= rule.Target
		default:
			continue
		}
		if !triggered {
			continue
		}
		dedupKey := fmt.Sprintf("%s:%s:%0.8f", rule.ID, rule.Condition, rule.Target)
		if _, seen := e.triggered[dedupKey]; seen {
			continue
		}
		e.triggered[dedupKey] = struct{}{}
		events = append(events, contracts.MarketAlertEvent{
			ID:          hashAlertID(rule, ts),
			RuleID:      rule.ID,
			Symbol:      symbol,
			Condition:   string(rule.Condition),
			Target:      rule.Target,
			Price:       price,
			Previous:    prev,
			TriggeredAt: ts.UTC().Format(time.RFC3339Nano),
			Message:     rule.Message,
		})
	}
	return events
}

func hashAlertID(rule AlertRule, ts time.Time) string {
	sum := sha1.Sum([]byte(fmt.Sprintf("%s|%s|%s|%0.8f|%d", rule.ID, rule.Symbol, rule.Condition, rule.Target, ts.UnixNano())))
	return hex.EncodeToString(sum[:8])
}
