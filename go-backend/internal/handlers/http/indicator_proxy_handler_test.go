package http

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

type fakeIndicatorProxyClient struct {
	status   int
	body     []byte
	err      error
	lastPath string
	lastBody []byte
}

func (f *fakeIndicatorProxyClient) PostJSON(_ context.Context, path string, payload []byte) (int, []byte, error) {
	f.lastPath = path
	f.lastBody = append([]byte(nil), payload...)
	return f.status, f.body, f.err
}

func TestIndicatorProxyHandler_ForwardsJSONResponse(t *testing.T) {
	client := &fakeIndicatorProxyClient{
		status: http.StatusCreated,
		body:   []byte(`{"success":true,"value":42}`),
	}
	handler := IndicatorProxyHandler(client, "/composite")

	req := httptest.NewRequest(http.MethodPost, "/api/v1/signals/composite", strings.NewReader(`{"symbol":"AAPL"}`))
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusCreated {
		t.Fatalf("expected status 201, got %d", res.Code)
	}
	if got := res.Header().Get("Content-Type"); got != "application/json" {
		t.Fatalf("expected application/json content-type, got %q", got)
	}
	if strings.TrimSpace(res.Body.String()) != `{"success":true,"value":42}` {
		t.Fatalf("unexpected body: %s", res.Body.String())
	}
	if client.lastPath != "/composite" {
		t.Fatalf("expected upstream path /composite, got %s", client.lastPath)
	}
	if string(client.lastBody) != `{"symbol":"AAPL"}` {
		t.Fatalf("unexpected forwarded body: %s", string(client.lastBody))
	}
}

func TestIndicatorProxyHandler_DefaultsZeroStatusTo200(t *testing.T) {
	client := &fakeIndicatorProxyClient{
		status: 0,
		body:   []byte(`{"ok":true}`),
	}
	handler := IndicatorProxyHandler(client, "/evaluate")
	req := httptest.NewRequest(http.MethodPost, "/api/v1/evaluate/strategy", strings.NewReader(`{}`))
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}
}

func TestIndicatorProxyHandler_RejectsMethodAndErrors(t *testing.T) {
	t.Run("method not allowed", func(t *testing.T) {
		handler := IndicatorProxyHandler(&fakeIndicatorProxyClient{}, "/path")
		req := httptest.NewRequest(http.MethodGet, "/api/v1/signals/composite", nil)
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)
		if res.Code != http.StatusMethodNotAllowed {
			t.Fatalf("expected status 405, got %d", res.Code)
		}
		if allow := res.Header().Get("Allow"); allow != http.MethodPost {
			t.Fatalf("expected Allow=POST, got %q", allow)
		}
	})

	t.Run("nil client", func(t *testing.T) {
		handler := IndicatorProxyHandler(nil, "/path")
		req := httptest.NewRequest(http.MethodPost, "/api/v1/signals/composite", strings.NewReader(`{}`))
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)
		if res.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected status 503, got %d", res.Code)
		}
	})

	t.Run("upstream error", func(t *testing.T) {
		handler := IndicatorProxyHandler(&fakeIndicatorProxyClient{err: errors.New("boom")}, "/path")
		req := httptest.NewRequest(http.MethodPost, "/api/v1/signals/composite", strings.NewReader(`{}`))
		res := httptest.NewRecorder()

		handler.ServeHTTP(res, req)
		if res.Code != http.StatusBadGateway {
			t.Fatalf("expected status 502, got %d", res.Code)
		}
	})
}
