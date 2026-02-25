package http

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

type fakeGeopoliticalContradictionsProxyClient struct {
	status      int
	body        []byte
	err         error
	lastMethod  string
	lastPath    string
	lastBody    []byte
	lastHeaders map[string]string
}

func (f *fakeGeopoliticalContradictionsProxyClient) Do(_ context.Context, method, path string, payload []byte, headers map[string]string) (int, []byte, error) {
	f.lastMethod = method
	f.lastPath = path
	f.lastBody = append([]byte(nil), payload...)
	f.lastHeaders = map[string]string{}
	for k, v := range headers {
		f.lastHeaders[k] = v
	}
	return f.status, f.body, f.err
}

func TestGeopoliticalContradictionsProxyHandler_ForwardsListDetailAndPatch(t *testing.T) {
	t.Run("list GET", func(t *testing.T) {
		client := &fakeGeopoliticalContradictionsProxyClient{
			status: http.StatusOK,
			body:   []byte(`{"success":true,"contradictions":[]}`),
		}
		handler := GeopoliticalContradictionsProxyHandler(client)
		req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/contradictions?state=open", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)

		if res.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", res.Code)
		}
		if client.lastPath != "/api/geopolitical/contradictions?state=open" {
			t.Fatalf("unexpected path: %s", client.lastPath)
		}
	})

	t.Run("detail PATCH forwards body and actor", func(t *testing.T) {
		client := &fakeGeopoliticalContradictionsProxyClient{
			status: http.StatusOK,
			body:   []byte(`{"success":true}`),
		}
		handler := GeopoliticalContradictionsProxyHandler(client)
		req := httptest.NewRequest(http.MethodPatch, "/api/v1/geopolitical/contradictions/x-1", strings.NewReader(`{"state":"resolved"}`))
		req.Header.Set("X-Geo-Actor", "analyst.mira")
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)

		if res.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", res.Code)
		}
		if client.lastPath != "/api/geopolitical/contradictions/x-1" {
			t.Fatalf("unexpected path: %s", client.lastPath)
		}
		if got := client.lastHeaders["X-Geo-Actor"]; got != "analyst.mira" {
			t.Fatalf("expected actor header forwarded, got %q", got)
		}
		if string(client.lastBody) != `{"state":"resolved"}` {
			t.Fatalf("unexpected body: %s", string(client.lastBody))
		}
	})
}

func TestGeopoliticalContradictionsProxyHandler_ErrorsAndValidation(t *testing.T) {
	t.Run("unsupported nested path", func(t *testing.T) {
		handler := GeopoliticalContradictionsProxyHandler(&fakeGeopoliticalContradictionsProxyClient{})
		req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/contradictions/x-1/history", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d", res.Code)
		}
	})

	t.Run("detail POST rejected", func(t *testing.T) {
		handler := GeopoliticalContradictionsProxyHandler(&fakeGeopoliticalContradictionsProxyClient{})
		req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/contradictions/x-1", strings.NewReader(`{}`))
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusMethodNotAllowed {
			t.Fatalf("expected 405, got %d", res.Code)
		}
	})

	t.Run("upstream error", func(t *testing.T) {
		handler := GeopoliticalContradictionsProxyHandler(&fakeGeopoliticalContradictionsProxyClient{err: errors.New("boom")})
		req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/contradictions", nil)
		res := httptest.NewRecorder()
		handler.ServeHTTP(res, req)
		if res.Code != http.StatusBadGateway {
			t.Fatalf("expected 502, got %d", res.Code)
		}
	})
}

func TestGeopoliticalTimelineProxyHandler(t *testing.T) {
	client := &fakeGeopoliticalContradictionsProxyClient{
		status: http.StatusOK,
		body:   []byte(`{"success":true,"timeline":[]}`),
	}
	handler := GeopoliticalTimelineProxyHandler(client)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/timeline?eventId=e-1&limit=5", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	if client.lastPath != "/api/geopolitical/timeline?eventId=e-1&limit=5" {
		t.Fatalf("unexpected path: %s", client.lastPath)
	}
}
