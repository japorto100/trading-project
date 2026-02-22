package cfr

import (
	"context"
	"testing"
)

func TestClientList_FiltersByRegionAndQuery(t *testing.T) {
	t.Parallel()

	client := NewClient()
	items, err := client.List(context.Background(), 10, "middle", "ceasefire")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected 1 item, got %d", len(items))
	}
	if items[0].ID != "cfr-israeli-palestinian" {
		t.Fatalf("unexpected id %q", items[0].ID)
	}
}

func TestClientList_RespectsLimit(t *testing.T) {
	t.Parallel()

	client := NewClient()
	items, err := client.List(context.Background(), 2, "", "")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("expected 2 items, got %d", len(items))
	}
}
