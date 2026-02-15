package finnhub

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
	"tradeviewfusion/go-backend/internal/connectors/gct"
)

func TestGetTicker_ReturnsQuoteForEquity(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/quote" {
			t.Fatalf("expected /quote path, got %s", r.URL.Path)
		}
		if r.URL.Query().Get("symbol") != "AAPL" {
			t.Fatalf("expected symbol AAPL, got %s", r.URL.Query().Get("symbol"))
		}
		_, _ = w.Write([]byte(`{"c":205.12,"h":207.5,"l":203.9,"t":1771200000}`))
	}))
	defer server.Close()

	client := NewClient(Config{
		BaseURL: server.URL,
		APIKey:  "token",
	})

	ticker, err := client.GetTicker(context.Background(), gct.Pair{Base: "AAPL", Quote: "USD"}, "equity")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ticker.Last != 205.12 {
		t.Fatalf("expected last 205.12, got %f", ticker.Last)
	}
	if ticker.Currency != "AAPL" {
		t.Fatalf("expected currency AAPL, got %s", ticker.Currency)
	}
}

func TestGetTicker_RejectsMissingKey(t *testing.T) {
	client := NewClient(Config{})
	_, err := client.GetTicker(context.Background(), gct.Pair{Base: "AAPL", Quote: "USD"}, "equity")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	requestErr, ok := err.(*gct.RequestError)
	if !ok {
		t.Fatalf("expected *gct.RequestError, got %T", err)
	}
	if requestErr.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected status 401, got %d", requestErr.StatusCode)
	}
}

func TestGetTicker_RejectsUnsupportedAssetType(t *testing.T) {
	client := NewClient(Config{
		APIKey: "token",
	})
	_, err := client.GetTicker(context.Background(), gct.Pair{Base: "AAPL", Quote: "USD"}, "spot")
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

func TestOpenTradeStream_EmitsTradeTicker(t *testing.T) {
	upgrader := websocket.Upgrader{}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("token") != "token" {
			t.Fatalf("expected token query")
		}

		connection, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			t.Fatalf("upgrade failed: %v", err)
		}
		defer connection.Close()

		_, message, err := connection.ReadMessage()
		if err != nil {
			t.Fatalf("read subscribe message failed: %v", err)
		}
		if !strings.Contains(string(message), "\"symbol\":\"AAPL\"") {
			t.Fatalf("expected subscribe message for AAPL, got %s", string(message))
		}

		err = connection.WriteJSON(map[string]any{
			"type": "trade",
			"data": []map[string]any{
				{
					"p": 205.12,
					"s": "AAPL",
					"t": 1771200000000,
					"v": 1200,
				},
			},
		})
		if err != nil {
			t.Fatalf("write trade payload failed: %v", err)
		}
	}))
	defer server.Close()

	wsURL := strings.Replace(server.URL, "http://", "ws://", 1)
	client := NewClient(Config{
		APIKey:    "token",
		WSBaseURL: wsURL,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	tickerChannel, errorChannel, err := client.OpenTradeStream(ctx, "AAPL")
	if err != nil {
		t.Fatalf("open trade stream failed: %v", err)
	}

	select {
	case streamErr := <-errorChannel:
		t.Fatalf("unexpected stream error: %v", streamErr)
	case ticker := <-tickerChannel:
		if ticker.Pair.Base != "AAPL" || ticker.Pair.Quote != "USD" {
			t.Fatalf("unexpected pair: %s/%s", ticker.Pair.Base, ticker.Pair.Quote)
		}
		if ticker.Last != 205.12 {
			t.Fatalf("expected last 205.12, got %f", ticker.Last)
		}
		if ticker.LastUpdated != 1771200000 {
			t.Fatalf("expected unix seconds 1771200000, got %d", ticker.LastUpdated)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("timeout waiting for ticker")
	}
}

func TestOpenTradeStream_RejectsMissingKey(t *testing.T) {
	client := NewClient(Config{})

	_, _, err := client.OpenTradeStream(context.Background(), "AAPL")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	requestErr, ok := err.(*gct.RequestError)
	if !ok {
		t.Fatalf("expected *gct.RequestError, got %T", err)
	}
	if requestErr.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected status 401, got %d", requestErr.StatusCode)
	}
}
