package ecb

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

const sampleRatesXML = `<?xml version="1.0" encoding="UTF-8"?>
<gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01" xmlns="http://www.ecb.int/vocabulary/2002-08-01/eurofxref">
  <Cube>
    <Cube time="2026-02-15">
      <Cube currency="USD" rate="1.1000"/>
      <Cube currency="JPY" rate="160.00"/>
      <Cube currency="GBP" rate="0.8600"/>
    </Cube>
  </Cube>
</gesmes:Envelope>`

func TestGetTicker_EURUSD(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/xml")
		_, _ = w.Write([]byte(sampleRatesXML))
	}))
	defer server.Close()

	client := NewClient(Config{RatesURL: server.URL})
	ticker, err := client.GetTicker(context.Background(), gct.Pair{Base: "EUR", Quote: "USD"})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 1.1 {
		t.Fatalf("expected last 1.1, got %f", ticker.Last)
	}
	if ticker.Pair.Base != "EUR" || ticker.Pair.Quote != "USD" {
		t.Fatalf("unexpected pair %s/%s", ticker.Pair.Base, ticker.Pair.Quote)
	}
}

func TestGetTicker_CrossPair(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/xml")
		_, _ = w.Write([]byte(sampleRatesXML))
	}))
	defer server.Close()

	client := NewClient(Config{RatesURL: server.URL})
	ticker, err := client.GetTicker(context.Background(), gct.Pair{Base: "GBP", Quote: "USD"})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	expected := 1.1 / 0.86
	if ticker.Last != expected {
		t.Fatalf("expected last %f, got %f", expected, ticker.Last)
	}
}

func TestGetTicker_UnsupportedPairReturnsBadRequest(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/xml")
		_, _ = w.Write([]byte(sampleRatesXML))
	}))
	defer server.Close()

	client := NewClient(Config{RatesURL: server.URL})
	_, err := client.GetTicker(context.Background(), gct.Pair{Base: "BTC", Quote: "USD"})
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	requestErr, ok := err.(*gct.RequestError)
	if !ok {
		t.Fatalf("expected *gct.RequestError, got %T", err)
	}
	if requestErr.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", requestErr.StatusCode)
	}
}
