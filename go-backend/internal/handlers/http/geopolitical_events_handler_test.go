package http

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

type fakeGeopoliticalEventsClient struct {
	events    []geopoliticalServices.Event
	err       error
	lastQuery geopoliticalServices.Query
}

func (f *fakeGeopoliticalEventsClient) ListEvents(_ context.Context, query geopoliticalServices.Query) ([]geopoliticalServices.Event, error) {
	f.lastQuery = query
	if f.err != nil {
		return nil, f.err
	}
	return f.events, nil
}

func TestGeopoliticalEventsHandler_ReturnsStableContract(t *testing.T) {
	t.Parallel()

	client := &fakeGeopoliticalEventsClient{
		events: []geopoliticalServices.Event{
			{
				ID:           "UKR123",
				EventDate:    "2026-01-10",
				Country:      "Ukraine",
				Region:       "Eastern Europe",
				EventType:    "Battles",
				SubEventType: "Armed clash",
				Actor1:       "Actor A",
				Actor2:       "Actor B",
				Fatalities:   3,
				Location:     "Kyiv",
				Latitude:     50.4501,
				Longitude:    30.5234,
				Source:       "Example Source",
				Notes:        "Example note",
			},
		},
	}
	handler := GeopoliticalEventsHandler(client)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/events?source=acled&country=Ukraine&region=Eastern%20Europe&eventType=Battles&subEventType=Armed%20clash&from=2026-01-01&to=2026-01-31&limit=25", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}

	var body struct {
		Success bool `json:"success"`
		Data    struct {
			Source  string `json:"source"`
			Filters struct {
				Source       string `json:"source"`
				Country      string `json:"country"`
				Region       string `json:"region"`
				EventType    string `json:"eventType"`
				SubEventType string `json:"subEventType"`
				StartDate    string `json:"startDate"`
				EndDate      string `json:"endDate"`
				Limit        int    `json:"limit"`
			} `json:"filters"`
			Items []struct {
				ID string `json:"id"`
			} `json:"items"`
		} `json:"data"`
	}
	if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if !body.Success {
		t.Fatal("expected success=true")
	}
	if body.Data.Source != "acled" {
		t.Fatalf("expected source acled, got %s", body.Data.Source)
	}
	if body.Data.Filters.Source != "acled" {
		t.Fatalf("expected filters.source acled, got %s", body.Data.Filters.Source)
	}
	if body.Data.Filters.Country != "Ukraine" {
		t.Fatalf("expected country filter Ukraine, got %s", body.Data.Filters.Country)
	}
	if body.Data.Filters.Region != "Eastern Europe" {
		t.Fatalf("expected region filter Eastern Europe, got %s", body.Data.Filters.Region)
	}
	if body.Data.Filters.SubEventType != "Armed clash" {
		t.Fatalf("expected subEventType Armed clash, got %s", body.Data.Filters.SubEventType)
	}
	if body.Data.Filters.Limit != 25 {
		t.Fatalf("expected limit 25, got %d", body.Data.Filters.Limit)
	}
	if len(body.Data.Items) != 1 || body.Data.Items[0].ID != "UKR123" {
		t.Fatalf("expected one mapped item UKR123, got %+v", body.Data.Items)
	}
	if client.lastQuery.Source != "acled" {
		t.Fatalf("expected forwarded source acled, got %q", client.lastQuery.Source)
	}
}

func TestGeopoliticalEventsHandler_AllowsGDELTSource(t *testing.T) {
	t.Parallel()

	client := &fakeGeopoliticalEventsClient{
		events: []geopoliticalServices.Event{{ID: "gdelt-1"}},
	}
	handler := GeopoliticalEventsHandler(client)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/events?source=gdelt&limit=10", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
	if client.lastQuery.Source != "gdelt" {
		t.Fatalf("expected forwarded source gdelt, got %q", client.lastQuery.Source)
	}
}

func TestGeopoliticalEventsHandler_RejectsInvalidSource(t *testing.T) {
	t.Parallel()

	handler := GeopoliticalEventsHandler(&fakeGeopoliticalEventsClient{})
	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/events?source=foo", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", res.Code)
	}
}

func TestGeopoliticalEventsHandler_RejectsInvalidDate(t *testing.T) {
	t.Parallel()

	handler := GeopoliticalEventsHandler(&fakeGeopoliticalEventsClient{})
	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/events?from=20260101", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", res.Code)
	}
}

func TestGeopoliticalEventsHandler_MapsServiceErrorTo502(t *testing.T) {
	t.Parallel()

	handler := GeopoliticalEventsHandler(&fakeGeopoliticalEventsClient{
		err: errors.New("upstream failed"),
	})
	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/events", nil)
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusBadGateway {
		t.Fatalf("expected status 502, got %d", res.Code)
	}
}
