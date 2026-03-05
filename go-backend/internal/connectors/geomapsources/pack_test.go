package geomapsources

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestMapSanctionsToCandidate(t *testing.T) {
	// Test via FetchAndMapToCandidates with mock HTTP - mapSanctionsToCandidate is used internally
	// when Added has entries. We use httptest to provide valid responses.
	ofacXML := `<?xml version="1.0"?><sdnList><sdnEntry><uid>123</uid><lastName>TestPerson</lastName><sdnType>individual</sdnType></sdnEntry></sdnList>`
	unXML := `<?xml version="1.0"?><CONSOLIDATED_LIST><INDIVIDUALS><INDIVIDUAL><DATAID>QDi.001</DATAID><FIRST_NAME>UN</FIRST_NAME><SECOND_NAME>Person</SECOND_NAME></INDIVIDUAL></INDIVIDUALS><ENTITIES/></CONSOLIDATED_LIST>`
	secoJSON := `[{"id":"seco1","name":"SECO Entity"}]`
	euJSON := `[{"id":"eu1","name":"EU Entity"}]`

	mux := http.NewServeMux()
	mux.HandleFunc("/sdn.xml", func(w http.ResponseWriter, _ *http.Request) { _, _ = w.Write([]byte(ofacXML)) })
	mux.HandleFunc("/consolidated.xml", func(w http.ResponseWriter, _ *http.Request) { _, _ = w.Write([]byte(unXML)) })
	mux.HandleFunc("/seco.json", func(w http.ResponseWriter, _ *http.Request) { _, _ = w.Write([]byte(secoJSON)) })
	mux.HandleFunc("/eu.json", func(w http.ResponseWriter, _ *http.Request) { _, _ = w.Write([]byte(euJSON)) })
	server := httptest.NewServer(mux)
	defer server.Close()

	tmp := t.TempDir()
	sanctionsDir := filepath.Join(tmp, "sanctions")
	_ = os.MkdirAll(sanctionsDir, 0755)

	// Override URLs via env so watchers hit our test server
	os.Setenv("OFAC_SDN_URL", server.URL+"/sdn.xml")
	os.Setenv("UN_SANCTIONS_URL", server.URL+"/consolidated.xml")
	os.Setenv("SECO_SANCTIONS_URL", server.URL+"/seco.json")
	os.Setenv("EU_SANCTIONS_URL", server.URL+"/eu.json")
	defer func() {
		os.Unsetenv("OFAC_SDN_URL")
		os.Unsetenv("UN_SANCTIONS_URL")
		os.Unsetenv("SECO_SANCTIONS_URL")
		os.Unsetenv("EU_SANCTIONS_URL")
	}()

	pack := NewGeoMapSourcePack(PackConfig{DataDir: tmp})
	candidates, err := pack.FetchAndMapToCandidates(context.Background())
	if err != nil {
		t.Fatalf("FetchAndMapToCandidates: %v", err)
	}
	// First run: all entries are "Added" (no previous store)
	if len(candidates) < 4 {
		t.Fatalf("expected at least 4 candidates (1 OFAC + 1 UN + 1 SECO + 1 EU), got %d", len(candidates))
	}
	for _, c := range candidates {
		if c["headline"] == nil || c["id"] == nil || c["sourceRefs"] == nil {
			t.Fatalf("candidate missing required fields: %v", c)
		}
	}
}

func TestFetchAndMapToCandidates_NilPack(t *testing.T) {
	var pack *GeoMapSourcePack
	_, err := pack.FetchAndMapToCandidates(context.Background())
	if err == nil {
		t.Fatal("expected error for nil pack")
	}
}

func TestNewGeoMapSourcePack(t *testing.T) {
	tmp := t.TempDir()
	pack := NewGeoMapSourcePack(PackConfig{DataDir: tmp})
	if pack == nil {
		t.Fatal("expected non-nil pack")
	}
}

func TestSourceURL(t *testing.T) {
	if u := sourceURL("OFAC"); u == "" {
		t.Fatal("expected non-empty OFAC URL")
	}
	if u := sourceURL("UN"); u == "" {
		t.Fatal("expected non-empty UN URL")
	}
	if u := sourceURL("UNKNOWN"); u != "" {
		t.Fatalf("expected empty URL for unknown source, got %q", u)
	}
}
