package ecb

import (
	"context"
	"encoding/xml"
	"errors"
	"fmt"
	"net"
	"net/http"
	"strconv"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

const DefaultRatesURL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml"

type Config struct {
	RatesURL       string
	RequestTimeout time.Duration
}

type Client struct {
	ratesURL    string
	httpClient  *http.Client
	defaultPath string
}

type fxEnvelope struct {
	Cube fxOuterCube `xml:"Cube"`
}

type fxOuterCube struct {
	Cube fxDailyCube `xml:"Cube"`
}

type fxDailyCube struct {
	Time string       `xml:"time,attr"`
	Cube []fxRateCube `xml:"Cube"`
}

type fxRateCube struct {
	Currency string `xml:"currency,attr"`
	Rate     string `xml:"rate,attr"`
}

func NewClient(cfg Config) *Client {
	timeout := cfg.RequestTimeout
	if timeout <= 0 {
		timeout = 4 * time.Second
	}

	ratesURL := strings.TrimSpace(cfg.RatesURL)
	if ratesURL == "" {
		ratesURL = DefaultRatesURL
	}

	return &Client{
		ratesURL:    ratesURL,
		defaultPath: "/ecb/daily-rates",
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

func (c *Client) GetTicker(ctx context.Context, pair gct.Pair) (gct.Ticker, error) {
	series, err := c.GetSeries(ctx, pair, 1)
	if err != nil {
		return gct.Ticker{}, err
	}
	if len(series) == 0 {
		return gct.Ticker{}, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: http.StatusNotFound,
			Cause:      fmt.Errorf("no series points"),
		}
	}

	base := strings.ToUpper(strings.TrimSpace(pair.Base))
	quote := strings.ToUpper(strings.TrimSpace(pair.Quote))
	rate := series[0].Value
	lastUpdated := series[0].Timestamp
	if lastUpdated <= 0 {
		lastUpdated = time.Now().Unix()
	}

	return gct.Ticker{
		Pair:        gct.Pair{Base: base, Quote: quote},
		Currency:    base + "/" + quote,
		LastUpdated: lastUpdated,
		Last:        rate,
		Bid:         rate,
		Ask:         rate,
		High:        rate,
		Low:         rate,
		Volume:      0,
	}, nil
}

func (c *Client) GetSeries(ctx context.Context, pair gct.Pair, limit int) ([]gct.SeriesPoint, error) {
	base := strings.ToUpper(strings.TrimSpace(pair.Base))
	quote := strings.ToUpper(strings.TrimSpace(pair.Quote))
	if base == "" || quote == "" {
		return nil, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("invalid pair"),
		}
	}
	if limit <= 0 {
		limit = 1
	}

	envelope, err := c.fetchRates(ctx)
	if err != nil {
		return nil, err
	}

	rates, err := parseRates(envelope.Cube.Cube.Cube)
	if err != nil {
		return nil, err
	}

	rate, ok := convertRate(rates, base, quote)
	if !ok {
		return nil, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: http.StatusBadRequest,
			Cause:      fmt.Errorf("unsupported forex pair %s/%s", base, quote),
		}
	}

	lastUpdated := time.Now().Unix()
	if envelope.Cube.Cube.Time != "" {
		if parsedDate, parseErr := time.Parse("2006-01-02", envelope.Cube.Cube.Time); parseErr == nil {
			lastUpdated = parsedDate.Unix()
		}
	}

	return []gct.SeriesPoint{
		{
			Timestamp: lastUpdated,
			Value:     rate,
		},
	}, nil
}

func (c *Client) fetchRates(ctx context.Context) (fxEnvelope, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.ratesURL, nil)
	if err != nil {
		return fxEnvelope{}, fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Accept", "application/xml")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		timeout := false
		var netErr net.Error
		if errors.As(err, &netErr) && netErr.Timeout() {
			timeout = true
		}
		return fxEnvelope{}, &gct.RequestError{
			Path:    c.defaultPath,
			Timeout: timeout,
			Cause:   err,
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		return fxEnvelope{}, &gct.RequestError{
			Path:       c.defaultPath,
			StatusCode: resp.StatusCode,
		}
	}

	var envelope fxEnvelope
	if decodeErr := xml.NewDecoder(resp.Body).Decode(&envelope); decodeErr != nil {
		return fxEnvelope{}, fmt.Errorf("decode ecb xml: %w", decodeErr)
	}

	return envelope, nil
}

func parseRates(cubes []fxRateCube) (map[string]float64, error) {
	rates := map[string]float64{
		"EUR": 1,
	}
	for _, cube := range cubes {
		currency := strings.ToUpper(strings.TrimSpace(cube.Currency))
		if currency == "" {
			continue
		}

		rate, err := strconv.ParseFloat(strings.TrimSpace(cube.Rate), 64)
		if err != nil {
			return nil, fmt.Errorf("parse rate %s: %w", currency, err)
		}
		rates[currency] = rate
	}
	return rates, nil
}

func convertRate(rates map[string]float64, base, quote string) (float64, bool) {
	baseRate, okBase := rates[base]
	quoteRate, okQuote := rates[quote]
	if !okBase || !okQuote || baseRate == 0 {
		return 0, false
	}
	return quoteRate / baseRate, true
}
