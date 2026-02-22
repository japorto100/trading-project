package gdelt

import (
	"context"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const (
	DefaultBaseURL = "https://api.gdeltproject.org/api/v2/doc/doc"
	defaultLimit   = 50
	maxLimit       = 250
)

type Config struct {
	BaseURL        string
	RequestTimeout time.Duration
	RequestRetries int
}

type Query struct {
	Country      string
	Region       string
	EventType    string
	SubEventType string
	StartDate    string
	EndDate      string
	Limit        int
}

type Event struct {
	ID           string  `json:"id"`
	URL          string  `json:"url,omitempty"`
	EventDate    string  `json:"eventDate"`
	Country      string  `json:"country"`
	Region       string  `json:"region"`
	EventType    string  `json:"eventType"`
	SubEventType string  `json:"subEventType"`
	Actor1       string  `json:"actor1"`
	Actor2       string  `json:"actor2"`
	Fatalities   int     `json:"fatalities"`
	Location     string  `json:"location"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
	Source       string  `json:"source"`
	Notes        string  `json:"notes"`
}

type Client struct {
	baseURL        string
	requestRetries int
	httpClient     *http.Client
}

func NewClient(cfg Config) *Client {
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 5 * time.Second
	}

	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}

	retries := cfg.RequestRetries
	if retries < 0 {
		retries = 0
	}

	return &Client{
		baseURL:        strings.TrimSpace(baseURL),
		requestRetries: retries,
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

func (c *Client) FetchEvents(ctx context.Context, query Query) ([]Event, error) {
	limit := normalizeLimit(query.Limit)

	endpoint, err := url.Parse(c.baseURL)
	if err != nil {
		return nil, fmt.Errorf("build gdelt url: %w", err)
	}

	values := endpoint.Query()
	values.Set("query", buildQuery(query))
	values.Set("mode", "artlist")
	values.Set("format", "json")
	values.Set("maxrecords", strconv.Itoa(limit))
	values.Set("sort", "DateDesc")
	if from := strings.TrimSpace(query.StartDate); from != "" {
		values.Set("startdatetime", dateToStartDateTime(from))
	}
	if to := strings.TrimSpace(query.EndDate); to != "" {
		values.Set("enddatetime", dateToEndDateTime(to))
	}
	endpoint.RawQuery = values.Encode()

	var payload struct {
		Articles []struct {
			Title         string `json:"title"`
			URL           string `json:"url"`
			SeenDate      string `json:"seendate"`
			SourceCountry string `json:"sourcecountry"`
			Domain        string `json:"domain"`
		} `json:"articles"`
	}

	attempts := c.requestRetries + 1
	for attempt := 1; attempt <= attempts; attempt++ {
		req, reqErr := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
		if reqErr != nil {
			return nil, fmt.Errorf("build gdelt request: %w", reqErr)
		}
		req.Header.Set("Accept", "application/json")
		req.Header.Set("User-Agent", "tradeview-fusion-go-backend/1.0")

		resp, doErr := c.httpClient.Do(req)
		if doErr != nil {
			if attempt < attempts {
				if !sleepWithContext(ctx, backoffDuration(attempt)) {
					return nil, ctx.Err()
				}
				continue
			}
			return nil, fmt.Errorf("gdelt request failed: %w", doErr)
		}

		if resp.StatusCode >= http.StatusInternalServerError {
			_ = resp.Body.Close()
			if attempt < attempts {
				if !sleepWithContext(ctx, backoffDuration(attempt)) {
					return nil, ctx.Err()
				}
				continue
			}
			return nil, fmt.Errorf("gdelt request failed with status %d", resp.StatusCode)
		}
		if resp.StatusCode >= http.StatusBadRequest {
			_ = resp.Body.Close()
			return nil, fmt.Errorf("gdelt request failed with status %d", resp.StatusCode)
		}

		if decodeErr := json.NewDecoder(resp.Body).Decode(&payload); decodeErr != nil {
			_ = resp.Body.Close()
			if attempt < attempts {
				if !sleepWithContext(ctx, backoffDuration(attempt)) {
					return nil, ctx.Err()
				}
				continue
			}
			return nil, fmt.Errorf("decode gdelt response: %w", decodeErr)
		}
		_ = resp.Body.Close()
		break
	}

	events := make([]Event, 0, len(payload.Articles))
	for _, article := range payload.Articles {
		title := strings.TrimSpace(article.Title)
		eventDate := parseSeenDate(article.SeenDate)
		country := normalizeCountry(article.SourceCountry)
		if country == "" {
			country = strings.TrimSpace(query.Country)
		}
		region := strings.TrimSpace(query.Region)
		eventType := strings.TrimSpace(query.EventType)
		if eventType == "" {
			eventType = "Geopolitical News"
		}
		subEventType := strings.TrimSpace(query.SubEventType)
		source := strings.TrimSpace(article.Domain)
		if source == "" {
			source = "gdelt"
		}
		location := country
		if location == "" {
			location = region
		}
		if location == "" {
			location = "global"
		}

		id := buildEventID(article.URL, article.SeenDate, title)
		events = append(events, Event{
			ID:           id,
			URL:          strings.TrimSpace(article.URL),
			EventDate:    eventDate,
			Country:      country,
			Region:       region,
			EventType:    eventType,
			SubEventType: subEventType,
			Actor1:       "",
			Actor2:       "",
			Fatalities:   0,
			Location:     location,
			Latitude:     0,
			Longitude:    0,
			Source:       source,
			Notes:        title,
		})
	}

	return events, nil
}

func buildQuery(query Query) string {
	parts := make([]string, 0, 6)
	if value := strings.TrimSpace(query.Country); value != "" {
		parts = append(parts, value)
	}
	if value := strings.TrimSpace(query.Region); value != "" {
		parts = append(parts, value)
	}
	if value := strings.TrimSpace(query.EventType); value != "" {
		parts = append(parts, value)
	}
	if value := strings.TrimSpace(query.SubEventType); value != "" {
		parts = append(parts, value)
	}

	if len(parts) == 0 {
		return "geopolitical OR conflict OR sanctions OR military OR security"
	}
	return strings.Join(parts, " AND ")
}

func buildEventID(rawURL string, seenDate string, title string) string {
	base := strings.TrimSpace(rawURL) + "|" + strings.TrimSpace(seenDate) + "|" + strings.TrimSpace(title)
	sum := sha1.Sum([]byte(base))
	return "gdelt-" + hex.EncodeToString(sum[:])[:16]
}

func parseSeenDate(raw string) string {
	parsed, err := time.Parse("20060102T150405Z", strings.TrimSpace(raw))
	if err != nil {
		return time.Now().UTC().Format("2006-01-02")
	}
	return parsed.UTC().Format("2006-01-02")
}

func normalizeCountry(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return ""
	}
	return strings.ToUpper(trimmed)
}

func normalizeLimit(limit int) int {
	if limit <= 0 {
		return defaultLimit
	}
	if limit > maxLimit {
		return maxLimit
	}
	return limit
}

func dateToStartDateTime(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if len(trimmed) != len("2006-01-02") {
		return ""
	}
	return strings.ReplaceAll(trimmed, "-", "") + "000000"
}

func dateToEndDateTime(raw string) string {
	trimmed := strings.TrimSpace(raw)
	if len(trimmed) != len("2006-01-02") {
		return ""
	}
	return strings.ReplaceAll(trimmed, "-", "") + "235959"
}

func sleepWithContext(ctx context.Context, duration time.Duration) bool {
	timer := time.NewTimer(duration)
	defer timer.Stop()

	select {
	case <-ctx.Done():
		return false
	case <-timer.C:
		return true
	}
}

func backoffDuration(attempt int) time.Duration {
	if attempt <= 1 {
		return 150 * time.Millisecond
	}
	if attempt == 2 {
		return 350 * time.Millisecond
	}
	return 750 * time.Millisecond
}
