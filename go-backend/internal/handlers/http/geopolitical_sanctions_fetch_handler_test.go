package http

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	geomapsources "tradeviewfusion/go-backend/internal/connectors/geomapsources"
	geopoliticalServices "tradeviewfusion/go-backend/internal/services/geopolitical"
)

func TestGeopoliticalSanctionsFetchHandler_MethodNotAllowed(t *testing.T) {
	handler := GeopoliticalSanctionsFetchHandler(nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/geopolitical/admin/sanctions-fetch", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)
	if res.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected 405, got %d", res.Code)
	}
}

func TestGeopoliticalSanctionsFetchHandler_DependenciesUnavailable(t *testing.T) {
	handler := GeopoliticalSanctionsFetchHandler(nil, nil)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/admin/sanctions-fetch", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)
	if res.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", res.Code)
	}
}

func TestGeopoliticalSanctionsFetchHandler_SuccessEmpty(t *testing.T) {
	tmp := t.TempDir()
	store := geopoliticalServices.NewCandidateReviewStore(filepath.Join(tmp, "candidates.json"))

	// Use httptest to serve empty responses for all 4 sources.
	mux := http.NewServeMux()
	ofacEmpty := `<?xml version="1.0"?><sdnList></sdnList>`
	unEmpty := `<?xml version="1.0"?><CONSOLIDATED_LIST><INDIVIDUALS/><ENTITIES/></CONSOLIDATED_LIST>`
	mux.HandleFunc("/sdn.xml", func(w http.ResponseWriter, _ *http.Request) { _, _ = w.Write([]byte(ofacEmpty)) })
	mux.HandleFunc("/consolidated.xml", func(w http.ResponseWriter, _ *http.Request) { _, _ = w.Write([]byte(unEmpty)) })
	mux.HandleFunc("/seco.json", func(w http.ResponseWriter, _ *http.Request) { _, _ = w.Write([]byte(`[]`)) })
	mux.HandleFunc("/eu.json", func(w http.ResponseWriter, _ *http.Request) { _, _ = w.Write([]byte(`[]`)) })
	server := httptest.NewServer(mux)
	defer server.Close()

	osSetenv := func(k, v string) {
		if v == "" {
			os.Unsetenv(k)
		} else {
			os.Setenv(k, v)
		}
	}
	osSetenv("OFAC_SDN_URL", server.URL+"/sdn.xml")
	osSetenv("UN_SANCTIONS_URL", server.URL+"/consolidated.xml")
	osSetenv("SECO_SANCTIONS_URL", server.URL+"/seco.json")
	osSetenv("EU_SANCTIONS_URL", server.URL+"/eu.json")
	defer func() {
		osSetenv("OFAC_SDN_URL", "")
		osSetenv("UN_SANCTIONS_URL", "")
		osSetenv("SECO_SANCTIONS_URL", "")
		osSetenv("EU_SANCTIONS_URL", "")
	}()

	pack := geomapsources.NewGeoMapSourcePack(geomapsources.PackConfig{DataDir: tmp})

	handler := GeopoliticalSanctionsFetchHandler(pack, store)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/geopolitical/admin/sanctions-fetch", nil)
	res := httptest.NewRecorder()
	handler.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", res.Code, res.Body.String())
	}
	body := res.Body.String()
	if !strings.Contains(body, `"success":true`) {
		t.Fatalf("expected success in response: %s", body)
	}
}
