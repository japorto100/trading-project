package acled

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/connectors/gct"
)

const (
	DefaultBaseURL = "https://acleddata.com/api"
	defaultLimit   = 50
	maxLimit       = 500
	defaultPath    = "/acled/read"
)

type Config struct {
	BaseURL        string
	APIToken       string
	Email          string
	AccessKey      string
	RequestTimeout time.Duration
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
	baseClient *base.Client
	apiToken   string
	email      string
	accessKey  string
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

	return &Client{
		baseClient: base.NewClient(base.Config{
			BaseURL:    baseURL,
			Timeout:    timeout,
			RetryCount: 1,
		}),
		apiToken:  strings.TrimSpace(cfg.APIToken),
		email:     strings.TrimSpace(cfg.Email),
		accessKey: strings.TrimSpace(cfg.AccessKey),
	}
}

func (c *Client) FetchEvents(ctx context.Context, query Query) ([]Event, error) {
	if c.apiToken == "" && (c.email == "" || c.accessKey == "") {
		return nil, &gct.RequestError{
			Path:       defaultPath,
			StatusCode: http.StatusUnauthorized,
			Cause:      fmt.Errorf("missing acled credentials"),
		}
	}

	urlQuery := url.Values{}
	urlQuery.Set("_format", "json")
	urlQuery.Set("fields", "event_id_cnty,event_date,country,region,event_type,sub_event_type,actor1,actor2,fatalities,location,latitude,longitude,source,notes")
	urlQuery.Set("limit", strconv.Itoa(normalizeLimit(query.Limit)))

	country := strings.TrimSpace(query.Country)
	if country != "" {
		urlQuery.Set("country", country)
	}

	region := strings.TrimSpace(query.Region)
	if region != "" {
		urlQuery.Set("region", region)
	}

	eventType := strings.TrimSpace(query.EventType)
	if eventType != "" {
		urlQuery.Set("event_type", eventType)
	}

	subEventType := strings.TrimSpace(query.SubEventType)
	if subEventType != "" {
		urlQuery.Set("sub_event_type", subEventType)
	}

	startDate := strings.TrimSpace(query.StartDate)
	endDate := strings.TrimSpace(query.EndDate)
	switch {
	case startDate != "" && endDate != "":
		urlQuery.Set("event_date", fmt.Sprintf("%s|%s", startDate, endDate))
		urlQuery.Set("event_date_where", "BETWEEN")
	case startDate != "":
		urlQuery.Set("event_date", startDate)
		urlQuery.Set("event_date_where", ">=")
	case endDate != "":
		urlQuery.Set("event_date", endDate)
		urlQuery.Set("event_date_where", "<=")
	}

	if c.apiToken != "" {
		// Token auth is the preferred mode for ACLED.
	} else {
		urlQuery.Set("email", c.email)
		urlQuery.Set("key", c.accessKey)
	}

	req, err := c.baseClient.NewRequest(ctx, http.MethodGet, defaultPath, urlQuery, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	if c.apiToken != "" {
		req.Header.Set("Authorization", "Bearer "+c.apiToken)
	}

	resp, err := c.baseClient.Do(req)
	if err != nil {
		timeout := false
		var netErr net.Error
		if errors.As(err, &netErr) && netErr.Timeout() {
			timeout = true
		}
		return nil, &gct.RequestError{
			Path:    defaultPath,
			Timeout: timeout,
			Cause:   err,
		}
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode >= http.StatusBadRequest {
		return nil, &gct.RequestError{
			Path:       defaultPath,
			StatusCode: resp.StatusCode,
		}
	}

	var payload struct {
		Data []struct {
			ID           string `json:"event_id_cnty"`
			EventDate    string `json:"event_date"`
			Country      string `json:"country"`
			Region       string `json:"region"`
			EventType    string `json:"event_type"`
			SubEventType string `json:"sub_event_type"`
			Actor1       string `json:"actor1"`
			Actor2       string `json:"actor2"`
			Fatalities   any    `json:"fatalities"`
			Location     string `json:"location"`
			Latitude     any    `json:"latitude"`
			Longitude    any    `json:"longitude"`
			Source       string `json:"source"`
			Notes        string `json:"notes"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return nil, fmt.Errorf("decode acled response: %w", err)
	}

	events := make([]Event, 0, len(payload.Data))
	for _, item := range payload.Data {
		events = append(events, Event{
			ID:           strings.TrimSpace(item.ID),
			EventDate:    strings.TrimSpace(item.EventDate),
			Country:      strings.TrimSpace(item.Country),
			Region:       strings.TrimSpace(item.Region),
			EventType:    strings.TrimSpace(item.EventType),
			SubEventType: strings.TrimSpace(item.SubEventType),
			Actor1:       strings.TrimSpace(item.Actor1),
			Actor2:       strings.TrimSpace(item.Actor2),
			Fatalities:   parseInt(item.Fatalities),
			Location:     strings.TrimSpace(item.Location),
			Latitude:     parseFloat(item.Latitude),
			Longitude:    parseFloat(item.Longitude),
			Source:       strings.TrimSpace(item.Source),
			Notes:        strings.TrimSpace(item.Notes),
		})
	}
	return events, nil
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

func parseInt(value any) int {
	switch typed := value.(type) {
	case nil:
		return 0
	case float64:
		return int(typed)
	case int:
		return typed
	case json.Number:
		n, err := typed.Int64()
		if err == nil {
			return int(n)
		}
		f, err := typed.Float64()
		if err == nil {
			return int(f)
		}
	case string:
		trimmed := strings.TrimSpace(typed)
		if trimmed == "" {
			return 0
		}
		if n, err := strconv.Atoi(trimmed); err == nil {
			return n
		}
		if f, err := strconv.ParseFloat(trimmed, 64); err == nil {
			return int(f)
		}
	}
	return 0
}

func parseFloat(value any) float64 {
	switch typed := value.(type) {
	case nil:
		return 0
	case float64:
		return typed
	case int:
		return float64(typed)
	case json.Number:
		f, err := typed.Float64()
		if err == nil {
			return f
		}
	case string:
		trimmed := strings.TrimSpace(typed)
		if trimmed == "" {
			return 0
		}
		f, err := strconv.ParseFloat(trimmed, 64)
		if err == nil {
			return f
		}
	}
	return 0
}
