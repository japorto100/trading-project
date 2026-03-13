// Package finra provides FINRA ATS weekly summary fetcher. Phase 14c.2.
// The official Query API contract uses:
//   1. FIP OAuth client_credentials to obtain a Bearer token
//   2. POST https://api.finra.org/data/group/otcMarket/name/weeklySummary with a JSON payload
// Ref: REFERENCE_SOURCE_STATUS.md, https://developer.finra.org/docs
package finra

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

const (
	DefaultATSURL       = "https://api.finra.org/data/group/otcMarket/name/weeklySummary"
	DefaultOAuthTokenURL = "https://ews.fip.finra.org/fip/rest/ews/oauth2/access_token?grant_type=client_credentials"
)

var defaultWeeklySummaryFields = []string{
	"issueSymbolIdentifier",
	"issueName",
	"totalWeeklyShareQuantity",
	"totalWeeklyTradeCount",
	"lastUpdateDate",
}

var allowedWeeklySummaryFields = map[string]struct{}{
	"issueSymbolIdentifier":     {},
	"issueName":                 {},
	"marketClassCode":           {},
	"tierIdentifier":            {},
	"weekStartDate":             {},
	"lastUpdateDate":            {},
	"totalWeeklyShareQuantity":  {},
	"totalWeeklyTradeCount":     {},
	"issueSymbolIdentifierType": {},
}

var allowedCompareTypes = map[string]struct{}{
	"equal":          {},
	"not_equal":      {},
	"greater":        {},
	"greater_or_eq":  {},
	"less":           {},
	"less_or_eq":     {},
	"contains":       {},
}

type CompareFilter struct {
	CompareType string `json:"compareType"`
	FieldName   string `json:"fieldName"`
	FieldValue  any    `json:"fieldValue"`
}

type WeeklySummaryRequest struct {
	Fields         []string        `json:"fields,omitempty"`
	CompareFilters []CompareFilter `json:"compareFilters,omitempty"`
	Limit          int             `json:"limit,omitempty"`
	Offset         int             `json:"offset,omitempty"`
	Async          bool            `json:"async,omitempty"`
	SortFields     []string        `json:"sortFields,omitempty"`
}

type ATSFetcher struct {
	url          string
	tokenURL     string
	clientID     string
	clientSecret string
	bearerToken  string
	httpClient   *http.Client
}

type tokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
}

type asyncResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

func NewATSFetcher(httpClient *http.Client) *ATSFetcher {
	if httpClient == nil {
		httpClient = &http.Client{Timeout: durationMsOr("FINRA_ATS_HTTP_TIMEOUT_MS", 30000)}
	}
	return &ATSFetcher{
		url:          strings.TrimSpace(getEnv("FINRA_ATS_API_URL", DefaultATSURL)),
		tokenURL:     strings.TrimSpace(getEnv("FINRA_OAUTH_TOKEN_URL", DefaultOAuthTokenURL)),
		clientID:     strings.TrimSpace(os.Getenv("FINRA_API_CLIENT_ID")),
		clientSecret: strings.TrimSpace(os.Getenv("FINRA_API_CLIENT_SECRET")),
		bearerToken:  strings.TrimSpace(os.Getenv("FINRA_API_BEARER_TOKEN")),
		httpClient:   httpClient,
	}
}

func (f *ATSFetcher) URL() string {
	if f == nil {
		return ""
	}
	return f.url
}

func (f *ATSFetcher) HTTPClient() *http.Client {
	if f == nil {
		return nil
	}
	return f.httpClient
}

func (f *ATSFetcher) Fetch(ctx context.Context, req WeeklySummaryRequest) ([]map[string]any, error) {
	if f == nil {
		return nil, fmt.Errorf("finra ats fetcher unavailable")
	}
	token, err := f.bearer(ctx)
	if err != nil {
		return nil, err
	}

	body, err := normalizeWeeklySummaryRequest(req)
	if err != nil {
		return nil, err
	}

	payload, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("finra ats marshal request: %w", err)
	}
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, f.url, bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("finra ats request: %w", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+token)
	httpReq.Header.Set("Accept", "application/json")
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Data-API-Version", "1")
	httpReq.Header.Set("User-Agent", "tradeview-fusion/1.0")

	resp, err := f.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("finra ats fetch: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return nil, fmt.Errorf("finra ats upstream status %d", resp.StatusCode)
	}

	rows, err := decodeWeeklySummaryResponse(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("finra ats decode response: %w", err)
	}
	return rows, nil
}

func normalizeWeeklySummaryRequest(req WeeklySummaryRequest) (WeeklySummaryRequest, error) {
	body := req
	if body.Async {
		return WeeklySummaryRequest{}, fmt.Errorf("finra ats async mode not supported yet")
	}
	if len(body.Fields) == 0 {
		body.Fields = append([]string(nil), defaultWeeklySummaryFields...)
	}
	body.Fields = normalizeStringSlice(body.Fields)
	for _, field := range body.Fields {
		if _, ok := allowedWeeklySummaryFields[field]; !ok {
			return WeeklySummaryRequest{}, fmt.Errorf("finra ats unsupported field %q", field)
		}
	}
	if body.Limit <= 0 {
		body.Limit = 1000
	}
	if body.Limit > 5000 {
		body.Limit = 5000
	}
	if body.Offset < 0 {
		body.Offset = 0
	}
	for i, filter := range body.CompareFilters {
		fieldName := strings.TrimSpace(filter.FieldName)
		compareType := normalizeCompareType(filter.CompareType)
		if fieldName == "" {
			return WeeklySummaryRequest{}, fmt.Errorf("finra ats compareFilters[%d] fieldName required", i)
		}
		if _, ok := allowedCompareTypes[compareType]; !ok {
			return WeeklySummaryRequest{}, fmt.Errorf("finra ats compareFilters[%d] unsupported compareType %q", i, filter.CompareType)
		}
		body.CompareFilters[i].FieldName = fieldName
		body.CompareFilters[i].CompareType = compareType
	}
	body.SortFields = normalizeStringSlice(body.SortFields)
	if len(body.SortFields) > 0 {
		if !hasEqualFilter(body.CompareFilters, "weekStartDate") || !hasEqualFilter(body.CompareFilters, "tierIdentifier") {
			return WeeklySummaryRequest{}, fmt.Errorf("finra ats sortFields require EQUAL compareFilters on weekStartDate and tierIdentifier")
		}
	}
	return body, nil
}

func decodeWeeklySummaryResponse(r io.Reader) ([]map[string]any, error) {
	payload, err := io.ReadAll(r)
	if err != nil {
		return nil, err
	}
	trimmed := bytes.TrimSpace(payload)
	if len(trimmed) == 0 {
		return []map[string]any{}, nil
	}
	var rows []map[string]any
	if err := json.Unmarshal(trimmed, &rows); err == nil {
		return rows, nil
	}
	var wrapped struct {
		Data []map[string]any `json:"data"`
	}
	if err := json.Unmarshal(trimmed, &wrapped); err == nil && wrapped.Data != nil {
		return wrapped.Data, nil
	}
	var async asyncResponse
	if err := json.Unmarshal(trimmed, &async); err == nil && (strings.TrimSpace(async.Status) != "" || strings.TrimSpace(async.Message) != "") {
		return nil, fmt.Errorf("finra ats async/download response not supported yet")
	}
	return nil, fmt.Errorf("unsupported finra ats response shape")
}

func (f *ATSFetcher) bearer(ctx context.Context) (string, error) {
	if token := strings.TrimSpace(f.bearerToken); token != "" {
		return token, nil
	}
	if strings.TrimSpace(f.clientID) == "" || strings.TrimSpace(f.clientSecret) == "" {
		return "", fmt.Errorf("finra ats credentials missing: set FINRA_API_BEARER_TOKEN or FINRA_API_CLIENT_ID/FINRA_API_CLIENT_SECRET")
	}
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, f.tokenURL, nil)
	if err != nil {
		return "", fmt.Errorf("finra ats token request: %w", err)
	}
	httpReq.Header.Set("Authorization", "Basic "+basicCredential(f.clientID, f.clientSecret))
	httpReq.Header.Set("Accept", "application/json")
	httpReq.Header.Set("User-Agent", "tradeview-fusion/1.0")

	resp, err := f.httpClient.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("finra ats token fetch: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode >= http.StatusBadRequest {
		return "", fmt.Errorf("finra ats token upstream status %d", resp.StatusCode)
	}
	var tokenResp tokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return "", fmt.Errorf("finra ats token decode: %w", err)
	}
	if strings.TrimSpace(tokenResp.AccessToken) == "" {
		return "", fmt.Errorf("finra ats token missing access_token")
	}
	return tokenResp.AccessToken, nil
}

func basicCredential(id, secret string) string {
	return base64.StdEncoding.EncodeToString([]byte(id + ":" + secret))
}

func hasEqualFilter(filters []CompareFilter, field string) bool {
	for _, filter := range filters {
		if strings.EqualFold(strings.TrimSpace(filter.FieldName), field) && strings.EqualFold(strings.TrimSpace(filter.CompareType), "equal") {
			return true
		}
	}
	return false
}

func normalizeCompareType(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func normalizeStringSlice(values []string) []string {
	if len(values) == 0 {
		return nil
	}
	result := make([]string, 0, len(values))
	seen := make(map[string]struct{}, len(values))
	for _, value := range values {
		trimmed := strings.TrimSpace(value)
		if trimmed == "" {
			continue
		}
		if _, exists := seen[trimmed]; exists {
			continue
		}
		seen[trimmed] = struct{}{}
		result = append(result, trimmed)
	}
	return result
}

func getEnv(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func durationMsOr(key string, fallback int) time.Duration {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return time.Duration(fallback) * time.Millisecond
	}
	ms, err := strconv.Atoi(raw)
	if err != nil || ms <= 0 {
		return time.Duration(fallback) * time.Millisecond
	}
	return time.Duration(ms) * time.Millisecond
}
