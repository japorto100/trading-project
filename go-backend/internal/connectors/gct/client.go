package gct

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	gctrpc "github.com/thrasher-corp/gocryptotrader/gctrpc"
	gctauth "github.com/thrasher-corp/gocryptotrader/gctrpc/auth"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/status"
)

type Config struct {
	GrpcAddress          string
	JsonRPCAddress       string
	Username             string
	Password             string
	RequestTimeout       time.Duration
	RetryCount           int
	InsecureSkipVerifyTL bool
	PreferGRPC           bool
}

type HealthStatus struct {
	Upstream  string `json:"upstream"`
	Grpc      string `json:"grpc"`
	JSONRPC   string `json:"jsonrpc"`
	Connected bool   `json:"connected"`
	Error     string `json:"error,omitempty"`
}

type Pair struct {
	Base  string
	Quote string
}

type Ticker struct {
	Pair        Pair
	Currency    string
	LastUpdated int64
	Last        float64
	High        float64
	Low         float64
	Bid         float64
	Ask         float64
	Volume      float64
}

type SeriesPoint struct {
	Timestamp int64
	Value     float64
}

type Client struct {
	cfg        Config
	httpClient *http.Client

	grpcMu     sync.Mutex
	grpcConn   *grpc.ClientConn
	grpcClient gctrpc.GoCryptoTraderServiceClient
}

type RequestError struct {
	Path       string
	StatusCode int
	Timeout    bool
	Cause      error
}

func (e *RequestError) Error() string {
	if e == nil {
		return "gct request failed"
	}
	if e.Timeout {
		return fmt.Sprintf("request %s timed out", e.Path)
	}
	if e.StatusCode > 0 {
		return fmt.Sprintf("request %s failed with status %d", e.Path, e.StatusCode)
	}
	if e.Cause != nil {
		return fmt.Sprintf("request %s failed: %v", e.Path, e.Cause)
	}
	return fmt.Sprintf("request %s failed", e.Path)
}

func (e *RequestError) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Cause
}

type RPCError struct {
	Operation string
	Code      codes.Code
	Cause     error
}

func (e *RPCError) Error() string {
	if e == nil {
		return "gct rpc request failed"
	}
	return fmt.Sprintf("rpc %s failed (%s): %v", e.Operation, e.Code.String(), e.Cause)
}

func (e *RPCError) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Cause
}

func IsTimeout(err error) bool {
	var requestError *RequestError
	if errors.As(err, &requestError) {
		return requestError.Timeout
	}

	var rpcError *RPCError
	if errors.As(err, &rpcError) {
		return rpcError.Code == codes.DeadlineExceeded
	}

	return false
}

func StatusCode(err error) (int, bool) {
	var requestError *RequestError
	if errors.As(err, &requestError) && requestError.StatusCode > 0 {
		return requestError.StatusCode, true
	}

	var rpcError *RPCError
	if errors.As(err, &rpcError) {
		switch rpcError.Code {
		case codes.InvalidArgument:
			return http.StatusBadRequest, true
		case codes.Unauthenticated:
			return http.StatusUnauthorized, true
		case codes.PermissionDenied:
			return http.StatusForbidden, true
		case codes.NotFound:
			return http.StatusNotFound, true
		case codes.DeadlineExceeded:
			return http.StatusGatewayTimeout, true
		case codes.Unavailable:
			return http.StatusServiceUnavailable, true
		default:
			return http.StatusBadGateway, true
		}
	}

	return 0, false
}

func NewClient(cfg Config) *Client {
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 4 * time.Second
	}

	retryCount := cfg.RetryCount
	if retryCount < 0 {
		retryCount = 0
	}

	cfg.RequestTimeout = timeout
	cfg.RetryCount = retryCount

	transport := http.DefaultTransport.(*http.Transport).Clone()
	if cfg.InsecureSkipVerifyTL {
		if transport.TLSClientConfig == nil {
			transport.TLSClientConfig = &tls.Config{}
		}
		transport.TLSClientConfig.InsecureSkipVerify = true
	}

	return &Client{
		cfg: cfg,
		httpClient: &http.Client{
			Timeout:   timeout,
			Transport: transport,
		},
	}
}

func (c *Client) Health(ctx context.Context) HealthStatus {
	status := HealthStatus{
		Upstream: "gocryptotrader",
		Grpc:     c.cfg.GrpcAddress,
		JSONRPC:  c.cfg.JsonRPCAddress,
	}

	if c.cfg.PreferGRPC {
		if err := c.grpcPing(ctx); err == nil {
			status.Connected = true
			return status
		} else {
			status.Error = err.Error()
		}
	}

	var response map[string]any
	if err := c.getJSON(ctx, "/v1/getinfo", &response); err != nil {
		if status.Error != "" {
			status.Error = status.Error + "; fallback failed: " + err.Error()
		} else {
			status.Error = err.Error()
		}
		return status
	}

	status.Connected = true
	status.Error = ""
	return status
}

func (c *Client) GetTicker(ctx context.Context, exchange string, pair Pair, assetType string) (Ticker, error) {
	if c.cfg.PreferGRPC {
		ticker, err := c.getTickerGRPC(ctx, exchange, pair, assetType)
		if err == nil {
			return ticker, nil
		}
	}

	return c.getTickerHTTP(ctx, exchange, pair, assetType)
}

func (c *Client) OpenTickerStream(ctx context.Context, exchange string, pair Pair, assetType string) (<-chan Ticker, <-chan error, error) {
	serviceClient, err := c.grpcServiceClient(ctx)
	if err != nil {
		return nil, nil, err
	}

	request := &gctrpc.GetTickerStreamRequest{
		Exchange: exchange,
		Pair: &gctrpc.CurrencyPair{
			Delimiter: "/",
			Base:      strings.ToUpper(pair.Base),
			Quote:     strings.ToUpper(pair.Quote),
		},
		AssetType: strings.ToLower(assetType),
	}

	streamContext, cancel := c.withStreamContext(ctx)
	streamClient, streamErr := serviceClient.GetTickerStream(streamContext, request)
	if streamErr != nil {
		cancel()
		return nil, nil, wrapRPCError("GetTickerStream", streamErr)
	}

	tickerChannel := make(chan Ticker)
	errorChannel := make(chan error, 1)

	go func() {
		defer cancel()
		defer close(tickerChannel)
		defer close(errorChannel)

		for {
			response, recvErr := streamClient.Recv()
			if recvErr != nil {
				if errors.Is(recvErr, io.EOF) || ctx.Err() != nil {
					return
				}
				errorChannel <- wrapRPCError("GetTickerStream.Recv", recvErr)
				return
			}

			ticker := fromGRPCTicker(response)
			select {
			case <-ctx.Done():
				return
			case tickerChannel <- ticker:
			}
		}
	}()

	return tickerChannel, errorChannel, nil
}

func (c *Client) grpcPing(ctx context.Context) error {
	serviceClient, err := c.grpcServiceClient(ctx)
	if err != nil {
		return err
	}

	requestContext, cancel := c.withTimeout(ctx)
	defer cancel()

	_, infoErr := serviceClient.GetInfo(requestContext, &gctrpc.GetInfoRequest{})
	if infoErr != nil {
		return wrapRPCError("GetInfo", infoErr)
	}
	return nil
}

func (c *Client) getTickerGRPC(ctx context.Context, exchange string, pair Pair, assetType string) (Ticker, error) {
	serviceClient, err := c.grpcServiceClient(ctx)
	if err != nil {
		return Ticker{}, err
	}

	requestContext, cancel := c.withTimeout(ctx)
	defer cancel()

	response, callErr := serviceClient.GetTicker(requestContext, &gctrpc.GetTickerRequest{
		Exchange: exchange,
		Pair: &gctrpc.CurrencyPair{
			Delimiter: "/",
			Base:      strings.ToUpper(pair.Base),
			Quote:     strings.ToUpper(pair.Quote),
		},
		AssetType: strings.ToLower(assetType),
	})
	if callErr != nil {
		return Ticker{}, wrapRPCError("GetTicker", callErr)
	}

	return fromGRPCTicker(response), nil
}

func fromGRPCTicker(response *gctrpc.TickerResponse) Ticker {
	pair := Pair{}
	if response.GetPair() != nil {
		pair = Pair{Base: response.GetPair().GetBase(), Quote: response.GetPair().GetQuote()}
	}

	return Ticker{
		Pair:        pair,
		Currency:    response.GetCurrencyPair(),
		LastUpdated: response.GetLastUpdated(),
		Last:        response.GetLast(),
		High:        response.GetHigh(),
		Low:         response.GetLow(),
		Bid:         response.GetBid(),
		Ask:         response.GetAsk(),
		Volume:      response.GetVolume(),
	}
}

func (c *Client) grpcServiceClient(ctx context.Context) (gctrpc.GoCryptoTraderServiceClient, error) {
	c.grpcMu.Lock()
	defer c.grpcMu.Unlock()

	if c.grpcClient != nil {
		return c.grpcClient, nil
	}
	if strings.TrimSpace(c.cfg.GrpcAddress) == "" {
		return nil, fmt.Errorf("gct grpc address is empty")
	}

	dialContext, cancel := c.withTimeout(ctx)
	defer cancel()

	tlsConfig := &tls.Config{InsecureSkipVerify: c.cfg.InsecureSkipVerifyTL}
	dialOptions := []grpc.DialOption{
		grpc.WithTransportCredentials(credentials.NewTLS(tlsConfig)),
	}

	if c.cfg.Username != "" || c.cfg.Password != "" {
		dialOptions = append(dialOptions, grpc.WithPerRPCCredentials(gctauth.BasicAuth{
			Username: c.cfg.Username,
			Password: c.cfg.Password,
		}))
	}

	connection, dialErr := grpc.DialContext(dialContext, c.cfg.GrpcAddress, dialOptions...)
	if dialErr != nil {
		return nil, wrapRPCError("Dial", dialErr)
	}

	c.grpcConn = connection
	c.grpcClient = gctrpc.NewGoCryptoTraderServiceClient(connection)
	return c.grpcClient, nil
}

func wrapRPCError(operation string, err error) error {
	if err == nil {
		return nil
	}
	st, ok := status.FromError(err)
	if !ok {
		return &RPCError{Operation: operation, Code: codes.Unknown, Cause: err}
	}
	return &RPCError{Operation: operation, Code: st.Code(), Cause: err}
}

func (c *Client) withTimeout(ctx context.Context) (context.Context, context.CancelFunc) {
	if _, hasDeadline := ctx.Deadline(); hasDeadline {
		return context.WithCancel(ctx)
	}
	return context.WithTimeout(ctx, c.cfg.RequestTimeout)
}

func (c *Client) withStreamContext(ctx context.Context) (context.Context, context.CancelFunc) {
	return context.WithCancel(ctx)
}

func (c *Client) getTickerHTTP(ctx context.Context, exchange string, pair Pair, assetType string) (Ticker, error) {
	request := map[string]any{
		"exchange": exchange,
		"pair": map[string]string{
			"delimiter": "/",
			"base":      strings.ToUpper(pair.Base),
			"quote":     strings.ToUpper(pair.Quote),
		},
		"assetType": strings.ToLower(assetType),
	}

	var response struct {
		Pair struct {
			Base  string `json:"base"`
			Quote string `json:"quote"`
		} `json:"pair"`
		CurrencyPair string          `json:"currencyPair"`
		LastUpdated  json.RawMessage `json:"lastUpdated"`
		Last         float64         `json:"last"`
		High         float64         `json:"high"`
		Low          float64         `json:"low"`
		Bid          float64         `json:"bid"`
		Ask          float64         `json:"ask"`
		Volume       float64         `json:"volume"`
	}
	if err := c.postJSON(ctx, "/v1/getticker", request, &response); err != nil {
		return Ticker{}, err
	}

	lastUpdated, err := parseUnixTimestamp(response.LastUpdated)
	if err != nil {
		return Ticker{}, fmt.Errorf("parse lastUpdated: %w", err)
	}

	return Ticker{
		Pair:        Pair{Base: response.Pair.Base, Quote: response.Pair.Quote},
		Currency:    response.CurrencyPair,
		LastUpdated: lastUpdated,
		Last:        response.Last,
		High:        response.High,
		Low:         response.Low,
		Bid:         response.Bid,
		Ask:         response.Ask,
		Volume:      response.Volume,
	}, nil
}

func (c *Client) getJSON(ctx context.Context, path string, responseBody any) error {
	url := c.endpoint(path)
	attempts := c.cfg.RetryCount + 1
	var lastErr error
	for attempt := 1; attempt <= attempts; attempt++ {
		request, buildErr := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
		if buildErr != nil {
			return fmt.Errorf("build request: %w", buildErr)
		}
		request.Header.Set("Accept", "application/json")

		if c.cfg.Username != "" || c.cfg.Password != "" {
			request.SetBasicAuth(c.cfg.Username, c.cfg.Password)
		}

		response, requestErr := c.httpClient.Do(request)
		if requestErr != nil {
			timeout := false
			var netErr net.Error
			if errors.As(requestErr, &netErr) && netErr.Timeout() {
				timeout = true
			}

			lastErr = &RequestError{Path: path, Timeout: timeout, Cause: requestErr}
			if attempt < attempts && !timeout {
				time.Sleep(backoffDuration(attempt))
				continue
			}
			return lastErr
		}

		if response.StatusCode >= http.StatusBadRequest {
			_ = response.Body.Close()
			lastErr = &RequestError{Path: path, StatusCode: response.StatusCode}
			if attempt < attempts && response.StatusCode >= http.StatusInternalServerError {
				time.Sleep(backoffDuration(attempt))
				continue
			}
			return lastErr
		}

		if err := json.NewDecoder(response.Body).Decode(responseBody); err != nil {
			_ = response.Body.Close()
			return fmt.Errorf("decode response: %w", err)
		}
		_ = response.Body.Close()
		return nil
	}

	if lastErr != nil {
		return lastErr
	}
	return &RequestError{Path: path}
}

func (c *Client) postJSON(ctx context.Context, path string, requestBody any, responseBody any) error {
	payload, err := json.Marshal(requestBody)
	if err != nil {
		return fmt.Errorf("marshal request: %w", err)
	}

	url := c.endpoint(path)
	attempts := c.cfg.RetryCount + 1
	var lastErr error
	for attempt := 1; attempt <= attempts; attempt++ {
		request, buildErr := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
		if buildErr != nil {
			return fmt.Errorf("build request: %w", buildErr)
		}
		request.Header.Set("Content-Type", "application/json")

		if c.cfg.Username != "" || c.cfg.Password != "" {
			request.SetBasicAuth(c.cfg.Username, c.cfg.Password)
		}

		response, requestErr := c.httpClient.Do(request)
		if requestErr != nil {
			timeout := false
			var netErr net.Error
			if errors.As(requestErr, &netErr) && netErr.Timeout() {
				timeout = true
			}

			lastErr = &RequestError{Path: path, Timeout: timeout, Cause: requestErr}
			if attempt < attempts && !timeout {
				time.Sleep(backoffDuration(attempt))
				continue
			}
			return lastErr
		}

		if response.StatusCode >= http.StatusBadRequest {
			_ = response.Body.Close()
			lastErr = &RequestError{Path: path, StatusCode: response.StatusCode}
			if attempt < attempts && response.StatusCode >= http.StatusInternalServerError {
				time.Sleep(backoffDuration(attempt))
				continue
			}
			return lastErr
		}

		if err := json.NewDecoder(response.Body).Decode(responseBody); err != nil {
			_ = response.Body.Close()
			return fmt.Errorf("decode response: %w", err)
		}
		_ = response.Body.Close()
		return nil
	}

	if lastErr != nil {
		return lastErr
	}
	return &RequestError{Path: path}
}

func (c *Client) endpoint(path string) string {
	base := c.cfg.JsonRPCAddress
	if !strings.HasPrefix(base, "http://") && !strings.HasPrefix(base, "https://") {
		base = "http://" + base
	}
	return strings.TrimRight(base, "/") + path
}

func backoffDuration(attempt int) time.Duration {
	if attempt < 1 {
		attempt = 1
	}
	return time.Duration(attempt) * 120 * time.Millisecond
}

func parseUnixTimestamp(raw json.RawMessage) (int64, error) {
	if len(raw) == 0 {
		return 0, nil
	}

	var numeric int64
	if err := json.Unmarshal(raw, &numeric); err == nil {
		return numeric, nil
	}

	var stringValue string
	if err := json.Unmarshal(raw, &stringValue); err == nil {
		trimmed := strings.TrimSpace(stringValue)
		if trimmed == "" {
			return 0, nil
		}
		parsed, parseErr := strconv.ParseInt(trimmed, 10, 64)
		if parseErr != nil {
			return 0, parseErr
		}
		return parsed, nil
	}

	return 0, fmt.Errorf("unsupported timestamp payload: %s", string(raw))
}
