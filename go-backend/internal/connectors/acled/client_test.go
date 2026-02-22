package acled

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

func TestClientFetchEvents_WithBearerToken(t *testing.T) {
	t.Parallel()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/acled/read" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer token-123" {
			t.Fatalf("expected bearer token auth, got: %q", got)
		}
		query := r.URL.Query()
		if query.Get("_format") != "json" {
			t.Fatalf("expected _format=json, got %q", query.Get("_format"))
		}
		if query.Get("country") != "Ukraine" {
			t.Fatalf("expected country filter, got %q", query.Get("country"))
		}
		if query.Get("region") != "Eastern Europe" {
			t.Fatalf("expected region filter, got %q", query.Get("region"))
		}
		if query.Get("event_type") != "Battles" {
			t.Fatalf("expected event_type filter, got %q", query.Get("event_type"))
		}
		if query.Get("sub_event_type") != "Armed clash" {
			t.Fatalf("expected sub_event_type filter, got %q", query.Get("sub_event_type"))
		}
		if query.Get("event_date") != "2026-01-01|2026-01-31" {
			t.Fatalf("expected date range, got %q", query.Get("event_date"))
		}
		if query.Get("event_date_where") != "BETWEEN" {
			t.Fatalf("expected BETWEEN filter, got %q", query.Get("event_date_where"))
		}
		if query.Get("limit") != "25" {
			t.Fatalf("expected limit=25, got %q", query.Get("limit"))
		}
		if query.Get("fields") == "" {
			t.Fatal("expected selected fields")
		}

		_ = json.NewEncoder(w).Encode(map[string]any{
			"status": 200,
			"data": []map[string]any{
				{
					"event_id_cnty":  "UKR123",
					"event_date":     "2026-01-10",
					"country":        "Ukraine",
					"region":         "Eastern Europe",
					"event_type":     "Battles",
					"sub_event_type": "Armed clash",
					"actor1":         "Actor A",
					"actor2":         "Actor B",
					"fatalities":     "3",
					"location":       "Kyiv",
					"latitude":       "50.4501",
					"longitude":      "30.5234",
					"source":         "Example Source",
					"notes":          "Example note",
				},
			},
		})
	}))
	defer server.Close()

	client := NewClient(Config{
		BaseURL:  server.URL,
		APIToken: "token-123",
	})

	events, err := client.FetchEvents(context.Background(), Query{
		Country:      "Ukraine",
		Region:       "Eastern Europe",
		EventType:    "Battles",
		SubEventType: "Armed clash",
		StartDate:    "2026-01-01",
		EndDate:      "2026-01-31",
		Limit:        25,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(events) != 1 {
		t.Fatalf("expected exactly one event, got %d", len(events))
	}
	if events[0].ID != "UKR123" {
		t.Fatalf("expected id UKR123, got %s", events[0].ID)
	}
	if events[0].Fatalities != 3 {
		t.Fatalf("expected fatalities=3, got %d", events[0].Fatalities)
	}
	if events[0].Region != "Eastern Europe" {
		t.Fatalf("expected region Eastern Europe, got %s", events[0].Region)
	}
}

func TestClientFetchEvents_WithLegacyCredentials(t *testing.T) {
	t.Parallel()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		if query.Get("email") != "ops@example.com" {
			t.Fatalf("expected email credential, got %q", query.Get("email"))
		}
		if query.Get("key") != "legacy-key" {
			t.Fatalf("expected key credential, got %q", query.Get("key"))
		}
		_ = json.NewEncoder(w).Encode(map[string]any{
			"status": 200,
			"data":   []map[string]any{},
		})
	}))
	defer server.Close()

	client := NewClient(Config{
		BaseURL:   server.URL,
		Email:     "ops@example.com",
		AccessKey: "legacy-key",
	})

	_, err := client.FetchEvents(context.Background(), Query{Limit: 5})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestClientFetchEvents_RequiresAuthentication(t *testing.T) {
	t.Parallel()

	client := NewClient(Config{
		BaseURL: "https://acleddata.com/api",
	})

	_, err := client.FetchEvents(context.Background(), Query{Limit: 5})
	if err == nil {
		t.Fatal("expected auth error, got nil")
	}

	var requestErr *gct.RequestError
	if !errors.As(err, &requestErr) {
		t.Fatalf("expected request error, got %T", err)
	}
	if requestErr.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected status 401, got %d", requestErr.StatusCode)
	}
}

func TestClientFetchEvents_MapsUpstreamStatus(t *testing.T) {
	t.Parallel()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer server.Close()

	client := NewClient(Config{
		BaseURL:  server.URL,
		APIToken: "token-123",
	})

	_, err := client.FetchEvents(context.Background(), Query{Limit: 5})
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	var requestErr *gct.RequestError
	if !errors.As(err, &requestErr) {
		t.Fatalf("expected request error, got %T", err)
	}
	if requestErr.StatusCode != http.StatusServiceUnavailable {
		t.Fatalf("expected status 503, got %d", requestErr.StatusCode)
	}
}
