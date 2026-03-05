// Package memory provides a Go client for the Python memory service (port 8093).
package memory

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/base"
	"tradeviewfusion/go-backend/internal/requestctx"
)

const DefaultBaseURL = "http://127.0.0.1:8093"

// Config holds configuration for the memory service client.
type Config struct {
	BaseURL        string
	RequestTimeout time.Duration
}

// Client is the memory service client.
type Client struct {
	baseClient *base.Client
}

// NewClient creates a new memory service client.
func NewClient(cfg Config) *Client {
	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = DefaultBaseURL
	}
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 5 * time.Second
	}
	return &Client{
		baseClient: base.NewClient(base.Config{
			BaseURL:    baseURL,
			Timeout:    timeout,
			RetryCount: 0,
		}),
	}
}

// ---------------------------------------------------------------------------
// Request/Response types
// ---------------------------------------------------------------------------

type KGSeedRequest struct {
	Force bool `json:"force"`
}

type KGSeedResponse struct {
	OK        bool   `json:"ok"`
	Seeded    bool   `json:"seeded"`
	NodeCount int    `json:"node_count"`
	Message   string `json:"message"`
}

type KGQueryRequest struct {
	Query      string         `json:"query"`
	Parameters map[string]any `json:"parameters"`
}

type KGQueryResponse struct {
	OK       bool             `json:"ok"`
	Rows     []map[string]any `json:"rows"`
	RowCount int              `json:"row_count"`
}

type KGNodesResponse struct {
	OK    bool             `json:"ok"`
	Nodes []map[string]any `json:"nodes"`
	Total int              `json:"total"`
}

type KGSyncResponse struct {
	OK       bool           `json:"ok"`
	Snapshot map[string]any `json:"snapshot"`
	Checksum string         `json:"checksum"`
	SyncedAt string         `json:"synced_at"`
}

type EpisodeCreateRequest struct {
	SessionID  string         `json:"session_id"`
	AgentRole  string         `json:"agent_role"`
	InputJSON  string         `json:"input_json"`
	OutputJSON string         `json:"output_json"`
	ToolsUsed  []string       `json:"tools_used"`
	DurationMs int            `json:"duration_ms"`
	TokenCount int            `json:"token_count"`
	Confidence float64        `json:"confidence"`
	Tags       []string       `json:"tags"`
	Metadata   map[string]any `json:"metadata"`
	RetainDays int            `json:"retain_days"`
}

type EpisodeResponse struct {
	OK        bool   `json:"ok"`
	ID        string `json:"id"`
	CreatedAt string `json:"created_at"`
}

type EpisodesListResponse struct {
	OK       bool             `json:"ok"`
	Episodes []map[string]any `json:"episodes"`
	Total    int              `json:"total"`
}

type VectorSearchRequest struct {
	Query          string         `json:"query"`
	NResults       int            `json:"n_results"`
	FilterMetadata map[string]any `json:"filter_metadata,omitempty"`
}

type VectorSearchResult struct {
	ID       string         `json:"id"`
	Text     string         `json:"text"`
	Distance float64        `json:"distance"`
	Metadata map[string]any `json:"metadata"`
}

type VectorSearchResponse struct {
	OK      bool                 `json:"ok"`
	Results []VectorSearchResult `json:"results"`
	Total   int                  `json:"total"`
}

type HealthResponse struct {
	OK       bool   `json:"ok"`
	KG       string `json:"kg"`
	Vector   string `json:"vector"`
	Cache    string `json:"cache"`
	Episodic string `json:"episodic"`
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

func (c *Client) addRequestID(ctx context.Context, req *http.Request) {
	if requestID := strings.TrimSpace(requestctx.RequestID(ctx)); requestID != "" {
		req.Header.Set("X-Request-ID", requestID)
	}
}

func (c *Client) postJSON(ctx context.Context, path string, body any, out any) error {
	encoded, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("memory client encode %s: %w", path, err)
	}
	req, err := c.baseClient.NewRequest(ctx, http.MethodPost, path, nil, bytes.NewReader(encoded))
	if err != nil {
		return fmt.Errorf("memory client build request %s: %w", path, err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	c.addRequestID(ctx, req)
	resp, err := c.baseClient.Do(req)
	if err != nil {
		return fmt.Errorf("memory client request %s: %w", path, err)
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return fmt.Errorf("memory client upstream status %d for %s", resp.StatusCode, path)
	}
	return json.NewDecoder(resp.Body).Decode(out)
}

func (c *Client) getJSON(ctx context.Context, path string, query map[string]string, out any) error {
	req, err := c.baseClient.NewRequest(ctx, http.MethodGet, path, nil, nil)
	if err != nil {
		return fmt.Errorf("memory client build GET %s: %w", path, err)
	}
	if len(query) > 0 {
		q := req.URL.Query()
		for k, v := range query {
			q.Set(k, v)
		}
		req.URL.RawQuery = q.Encode()
	}
	req.Header.Set("Accept", "application/json")
	c.addRequestID(ctx, req)
	resp, err := c.baseClient.Do(req)
	if err != nil {
		return fmt.Errorf("memory client GET %s: %w", path, err)
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return fmt.Errorf("memory client upstream GET status %d for %s", resp.StatusCode, path)
	}
	return json.NewDecoder(resp.Body).Decode(out)
}

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

func (c *Client) PostKGSeed(ctx context.Context, req KGSeedRequest) (KGSeedResponse, error) {
	var out KGSeedResponse
	if err := c.postJSON(ctx, "/api/v1/memory/kg/seed", req, &out); err != nil {
		return KGSeedResponse{}, err
	}
	return out, nil
}

func (c *Client) PostKGQuery(ctx context.Context, req KGQueryRequest) (KGQueryResponse, error) {
	var out KGQueryResponse
	if err := c.postJSON(ctx, "/api/v1/memory/kg/query", req, &out); err != nil {
		return KGQueryResponse{}, err
	}
	if out.Rows == nil {
		out.Rows = []map[string]any{}
	}
	return out, nil
}

func (c *Client) GetKGNodes(ctx context.Context, nodeType string, limit int) (KGNodesResponse, error) {
	if limit <= 0 {
		limit = 36
	}
	query := map[string]string{
		"nodeType": nodeType,
		"limit":    fmt.Sprintf("%d", limit),
	}
	var out KGNodesResponse
	if err := c.getJSON(ctx, "/api/v1/memory/kg/nodes", query, &out); err != nil {
		return KGNodesResponse{}, err
	}
	if out.Nodes == nil {
		out.Nodes = []map[string]any{}
	}
	return out, nil
}

func (c *Client) GetKGSync(ctx context.Context) (KGSyncResponse, error) {
	var out KGSyncResponse
	if err := c.getJSON(ctx, "/api/v1/memory/kg/sync", nil, &out); err != nil {
		return KGSyncResponse{}, err
	}
	return out, nil
}

func (c *Client) PostEpisode(ctx context.Context, req EpisodeCreateRequest) (EpisodeResponse, error) {
	var out EpisodeResponse
	if err := c.postJSON(ctx, "/api/v1/memory/episode", req, &out); err != nil {
		return EpisodeResponse{}, err
	}
	return out, nil
}

func (c *Client) GetEpisodes(ctx context.Context, agentRole string, limit int) (EpisodesListResponse, error) {
	if limit <= 0 {
		limit = 100
	}
	query := map[string]string{
		"limit": fmt.Sprintf("%d", limit),
	}
	if agentRole != "" {
		query["agentRole"] = agentRole
	}
	var out EpisodesListResponse
	if err := c.getJSON(ctx, "/api/v1/memory/episodes", query, &out); err != nil {
		return EpisodesListResponse{}, err
	}
	if out.Episodes == nil {
		out.Episodes = []map[string]any{}
	}
	return out, nil
}

func (c *Client) PostSearch(ctx context.Context, req VectorSearchRequest) (VectorSearchResponse, error) {
	var out VectorSearchResponse
	if err := c.postJSON(ctx, "/api/v1/memory/search", req, &out); err != nil {
		return VectorSearchResponse{}, err
	}
	if out.Results == nil {
		out.Results = []VectorSearchResult{}
	}
	return out, nil
}

func (c *Client) GetHealth(ctx context.Context) (HealthResponse, error) {
	var out HealthResponse
	if err := c.getJSON(ctx, "/health", nil, &out); err != nil {
		return HealthResponse{}, err
	}
	return out, nil
}
