package news

import (
	"context"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
)

func TestRSSClient_Fetch_RetriesOnTemporaryFailure(t *testing.T) {
	var attempts int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		current := atomic.AddInt32(&attempts, 1)
		if current == 1 {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/xml")
		_, _ = w.Write([]byte(`<?xml version="1.0"?>
<rss>
  <channel>
    <item>
      <title>Retry success</title>
      <link>https://example.com/retry</link>
      <description>ok</description>
      <pubDate>Mon, 15 Feb 2026 12:00:00 +0000</pubDate>
    </item>
  </channel>
</rss>`))
	}))
	defer server.Close()

	client := NewRSSClient(RSSClientConfig{
		FeedURLs:       []string{server.URL},
		RequestRetries: 1,
	})

	items, err := client.Fetch(context.Background(), "", 5)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected 1 item, got %d", len(items))
	}
	if atomic.LoadInt32(&attempts) < 2 {
		t.Fatalf("expected retry attempt, got %d attempts", attempts)
	}
}
