package news

import (
	"encoding/xml"
	"errors"
	"io"
	"strings"
	"time"

	marketServices "tradeviewfusion/go-backend/internal/services/market"
)

type rssDocument struct {
	Channel struct {
		Items []struct {
			Title       string `xml:"title"`
			Link        string `xml:"link"`
			Description string `xml:"description"`
			PubDate     string `xml:"pubDate"`
		} `xml:"item"`
	} `xml:"channel"`
}

func parseRSS(reader io.Reader, source string, maxItems int) ([]marketServices.Headline, error) {
	var doc rssDocument
	if err := xml.NewDecoder(reader).Decode(&doc); err != nil {
		return nil, err
	}

	if maxItems <= 0 {
		maxItems = len(doc.Channel.Items)
	}

	result := make([]marketServices.Headline, 0, maxItems)
	for i, item := range doc.Channel.Items {
		if i >= maxItems {
			break
		}
		publishedAt := time.Now().UTC()
		if parsedDate, err := parsePubDate(item.PubDate); err == nil {
			publishedAt = parsedDate
		}
		result = append(result, marketServices.Headline{
			Title:       strings.TrimSpace(item.Title),
			URL:         strings.TrimSpace(item.Link),
			Source:      source,
			PublishedAt: publishedAt,
			Summary:     strings.TrimSpace(item.Description),
		})
	}
	return result, nil
}

func parsePubDate(raw string) (time.Time, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return time.Time{}, errors.New("empty pubDate")
	}
	layouts := []string{
		time.RFC1123Z,
		time.RFC1123,
		time.RFC3339,
		"2006-01-02 15:04:05",
	}
	for _, layout := range layouts {
		if parsed, err := time.Parse(layout, raw); err == nil {
			return parsed.UTC(), nil
		}
	}
	return time.Time{}, errors.New("unsupported pubDate format")
}
