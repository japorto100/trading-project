package gdelt

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestClientFetchEvents_BuildsQueryAndMapsPayload(t *testing.T) {
	t.Parallel()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/v2/doc/doc" {
			t.Fatalf("unexpected path: %s", r.URL.Path)
		}
		query := r.URL.Query()
		if query.Get("query") != "Ukraine AND Europe AND Battles AND Armed clash" {
			t.Fatalf("unexpected query expression: %q", query.Get("query"))
		}
		if query.Get("mode") != "artlist" {
			t.Fatalf("expected mode=artlist, got %q", query.Get("mode"))
		}
		if query.Get("format") != "json" {
			t.Fatalf("expected format=json, got %q", query.Get("format"))
		}
		if query.Get("maxrecords") != "25" {
			t.Fatalf("expected maxrecords=25, got %q", query.Get("maxrecords"))
		}
		if query.Get("startdatetime") != "20260101000000" {
			t.Fatalf("expected startdatetime, got %q", query.Get("startdatetime"))
		}
		if query.Get("enddatetime") != "20260131235959" {
			t.Fatalf("expected enddatetime, got %q", query.Get("enddatetime"))
		}

		_ = json.NewEncoder(w).Encode(map[string]any{
			"articles": []map[string]any{
				{
					"title":         "Ceasefire talks stall",
					"url":           "https://example.com/story",
					"seendate":      "20260119T144500Z",
					"sourcecountry": "us",
					"domain":        "example.com",
				},
			},
		})
	}))
	defer server.Close()

	client := NewClient(Config{
		BaseURL:        server.URL + "/api/v2/doc/doc",
		RequestTimeout: 2 * time.Second,
		RequestRetries: 0,
	})

	events, err := client.FetchEvents(context.Background(), Query{
		Country:      "Ukraine",
		Region:       "Europe",
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
		t.Fatalf("expected one event, got %d", len(events))
	}
	item := events[0]
	if item.ID == "" {
		t.Fatal("expected generated id")
	}
	if item.EventDate != "2026-01-19" {
		t.Fatalf("unexpected event date: %q", item.EventDate)
	}
	if item.Country != "US" {
		t.Fatalf("expected normalized country US, got %q", item.Country)
	}
	if item.Region != "Europe" {
		t.Fatalf("expected region Europe, got %q", item.Region)
	}
	if item.EventType != "Battles" {
		t.Fatalf("expected event type Battles, got %q", item.EventType)
	}
	if item.SubEventType != "Armed clash" {
		t.Fatalf("expected sub event type Armed clash, got %q", item.SubEventType)
	}
	if item.Source != "example.com" {
		t.Fatalf("expected source domain, got %q", item.Source)
	}
	if item.URL != "https://example.com/story" {
		t.Fatalf("expected mapped url, got %q", item.URL)
	}
	if item.Notes != "Ceasefire talks stall" {
		t.Fatalf("expected notes from title, got %q", item.Notes)
	}
}

func TestClientFetchEvents_DefaultQueryAndLimitClamp(t *testing.T) {
	t.Parallel()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		if query.Get("query") != "geopolitical OR conflict OR sanctions OR military OR security" {
			t.Fatalf("unexpected default query: %q", query.Get("query"))
		}
		if query.Get("maxrecords") != "250" {
			t.Fatalf("expected maxrecords=250, got %q", query.Get("maxrecords"))
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"articles": []any{}})
	}))
	defer server.Close()

	client := NewClient(Config{
		BaseURL: server.URL,
	})

	items, err := client.FetchEvents(context.Background(), Query{Limit: 9999})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 0 {
		t.Fatalf("expected zero events, got %d", len(items))
	}
}
