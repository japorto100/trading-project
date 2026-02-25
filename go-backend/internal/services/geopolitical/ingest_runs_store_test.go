package geopolitical

import (
	"path/filepath"
	"testing"
)

func TestIngestRunsStore_AppendAndList(t *testing.T) {
	store := NewIngestRunsStore(filepath.Join(t.TempDir(), "ingest-runs.json"))
	if _, err := store.Append(GeoIngestRun{
		Kind:         "hard",
		Mode:         "next-proxy",
		UpstreamPath: "/api/geopolitical/candidates/ingest/hard",
		Actor:        "analyst",
		StatusCode:   200,
		Success:      true,
	}); err != nil {
		t.Fatalf("append ingest run: %v", err)
	}
	items, err := store.List(IngestRunsListFilters{Kind: "hard", Limit: 10})
	if err != nil {
		t.Fatalf("list ingest runs: %v", err)
	}
	if len(items) != 1 || items[0].Kind != "hard" {
		t.Fatalf("unexpected ingest runs list: %+v", items)
	}
}
