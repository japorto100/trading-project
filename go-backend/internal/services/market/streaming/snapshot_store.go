package streaming

import (
	"sync"
	"time"

	"tradeviewfusion/go-backend/internal/contracts"
)

type SnapshotKey struct {
	Symbol    string
	Exchange  string
	AssetType string
	Timeframe string
}

type SnapshotStore struct {
	mu    sync.RWMutex
	items map[SnapshotKey]contracts.MarketStreamSnapshot
}

func NewSnapshotStore() *SnapshotStore {
	return &SnapshotStore{items: make(map[SnapshotKey]contracts.MarketStreamSnapshot)}
}

func (s *SnapshotStore) UpsertQuote(key SnapshotKey, quote contracts.Quote) contracts.MarketStreamSnapshot {
	s.mu.Lock()
	defer s.mu.Unlock()
	item := s.items[key]
	item.Symbol = key.Symbol
	item.Exchange = key.Exchange
	item.AssetType = key.AssetType
	item.Timeframe = key.Timeframe
	item.Quote = &quote
	item.UpdatedAt = time.Now().UTC().Format(time.RFC3339Nano)
	s.items[key] = item
	return item
}

func (s *SnapshotStore) UpsertCandle(key SnapshotKey, candle contracts.Candle, history []contracts.Candle) contracts.MarketStreamSnapshot {
	s.mu.Lock()
	defer s.mu.Unlock()
	item := s.items[key]
	item.Symbol = key.Symbol
	item.Exchange = key.Exchange
	item.AssetType = key.AssetType
	item.Timeframe = key.Timeframe
	item.Candle = &candle
	if len(history) > 0 {
		item.Candles = append(item.Candles[:0], history...)
	}
	item.UpdatedAt = time.Now().UTC().Format(time.RFC3339Nano)
	s.items[key] = item
	return item
}

func (s *SnapshotStore) Get(key SnapshotKey) (contracts.MarketStreamSnapshot, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	item, ok := s.items[key]
	if !ok {
		return contracts.MarketStreamSnapshot{}, false
	}
	return cloneSnapshot(item), true
}

func cloneSnapshot(in contracts.MarketStreamSnapshot) contracts.MarketStreamSnapshot {
	out := in
	if in.Quote != nil {
		q := *in.Quote
		out.Quote = &q
	}
	if in.Candle != nil {
		c := *in.Candle
		out.Candle = &c
	}
	if len(in.Candles) > 0 {
		out.Candles = make([]contracts.Candle, len(in.Candles))
		copy(out.Candles, in.Candles)
	}
	return out
}
