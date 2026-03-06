package protocol_test

import (
	"encoding/json"
	"testing"

	"tradeviewfusion/go-backend/pkg/protocol"
)

func TestTickJSONRoundTrip(t *testing.T) {
	original := protocol.Tick{
		Symbol:    "BTC/USDT",
		Exchange:  "binance",
		AssetType: "spot",
		Last:      65000.50,
		Bid:       64999.00,
		Ask:       65001.00,
		Volume:    1234.56,
		Timestamp: 1700000000,
	}

	data, err := json.Marshal(original)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}

	var got protocol.Tick
	if err := json.Unmarshal(data, &got); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}

	if got != original {
		t.Fatalf("round-trip mismatch:\n  got  %+v\n  want %+v", got, original)
	}
}
