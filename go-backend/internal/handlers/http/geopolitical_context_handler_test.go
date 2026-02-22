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

type fakeGeopoliticalContextClient struct {
	items     []geopoliticalServices.ContextItem
	err       error
	lastQuery geopoliticalServices.ContextQuery
}

func (f *fakeGeopoliticalContextClient) ListContext(_ context.Context, query geopoliticalServices.ContextQuery) ([]geopoliticalServices.ContextItem, error) {
	f.lastQuery = query
	if f.err != nil {
		return nil, f.err
	}
	return f.items, nil
}

func TestGeopoliticalContextHandler_ReturnsStableContract(t *testing.T) {
	t.Parallel()

	client := &fakeGeopoliticalContextClient{
		items: []geopoliticalServices.ContextItem{
			{
				ID:          "cw-1",
				Source:      "crisiswatch",
				Title:       "Ukraine monthly update",
				URL:         "https://example.org/cw-1",
				Summary:     "Summary",
				PublishedAt: "2026-02-15T12:00:00Z",
				Region:      "Europe",
			},
		},
	}
	handler := GeopoliticalContextHandler(client)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/context?source=crisiswatch&limit=5&region=europe&q=ukraine", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}

	var body struct {
		Success bool `json:"success"`
		Data    struct {
			Source string `json:"source"`
			Items  []struct {
				Source string `json:"source"`
				Title  string `json:"title"`
			} `json:"items"`
		} `json:"data"`
	}
	if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if !body.Success {
		t.Fatal("expected success=true")
	}
	if body.Data.Source != "crisiswatch" {
		t.Fatalf("expected source crisiswatch, got %s", body.Data.Source)
	}
	if len(body.Data.Items) != 1 {
		t.Fatalf("expected one item, got %d", len(body.Data.Items))
	}
	if client.lastQuery.Limit != 5 {
		t.Fatalf("expected limit 5, got %d", client.lastQuery.Limit)
	}
}

func TestGeopoliticalContextHandler_RejectsInvalidSource(t *testing.T) {
	t.Parallel()

	handler := GeopoliticalContextHandler(&fakeGeopoliticalContextClient{})
	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/context?source=foo", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", res.Code)
	}
}

func TestGeopoliticalContextHandler_MapsUpstreamErrors(t *testing.T) {
	t.Parallel()

	handler := GeopoliticalContextHandler(&fakeGeopoliticalContextClient{
		err: errors.New("boom"),
	})
	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/context", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusBadGateway {
		t.Fatalf("expected 502, got %d", res.Code)
	}
}
