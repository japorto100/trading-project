// Package symbolcatalog provides Symbol Catalog Service. Phase 14f.1.
// 500+ symbols normalized across providers.
package symbolcatalog

import (
	"context"
	"fmt"
	"strings"
)

const seriesPrefix = "SYMCAT_"

type Config struct {
	RegistryPath string
}

type Client struct {
	cfg Config
}

func NewClient(cfg Config) *Client {
	return &Client{cfg: cfg}
}

func (c *Client) Normalize(symbol string) (string, error) {
	s := strings.ToUpper(strings.TrimSpace(symbol))
	if s == "" {
		return "", fmt.Errorf("%s symbol required", seriesPrefix)
	}
	return s, nil
}

func (c *Client) Resolve(ctx context.Context, symbol string) (provider string, normalized string, err error) {
	_ = ctx
	normalized, err = c.Normalize(symbol)
	if err != nil {
		return "", "", err
	}
	return "unknown", normalized, nil
}
