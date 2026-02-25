package market

import (
	"context"
	"fmt"
	"strings"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

type routedMacroClient interface {
	GetTicker(ctx context.Context, pair gct.Pair, assetType string) (gct.Ticker, error)
	GetSeries(ctx context.Context, pair gct.Pair, assetType string, limit int) ([]gct.SeriesPoint, error)
}

type RoutedMacroClient struct {
	defaultClient routedMacroClient
	prefixClients map[string]routedMacroClient
}

func NewRoutedMacroClient(defaultClient routedMacroClient, bcbClient routedMacroClient) *RoutedMacroClient {
	client := &RoutedMacroClient{
		defaultClient: defaultClient,
		prefixClients: make(map[string]routedMacroClient),
	}
	if bcbClient != nil {
		client.RegisterPrefixClient("BCB_SGS_", bcbClient)
	}
	return client
}

func (c *RoutedMacroClient) RegisterPrefixClient(prefix string, client routedMacroClient) {
	if c == nil || client == nil {
		return
	}
	normalizedPrefix := strings.ToUpper(strings.TrimSpace(prefix))
	if normalizedPrefix == "" {
		return
	}
	if c.prefixClients == nil {
		c.prefixClients = make(map[string]routedMacroClient)
	}
	c.prefixClients[normalizedPrefix] = client
}

func (c *RoutedMacroClient) GetTicker(ctx context.Context, pair gct.Pair, assetType string) (gct.Ticker, error) {
	client, err := c.selectClient(pair)
	if err != nil {
		return gct.Ticker{}, err
	}
	return client.GetTicker(ctx, pair, assetType)
}

func (c *RoutedMacroClient) GetSeries(ctx context.Context, pair gct.Pair, assetType string, limit int) ([]gct.SeriesPoint, error) {
	client, err := c.selectClient(pair)
	if err != nil {
		return nil, err
	}
	return client.GetSeries(ctx, pair, assetType, limit)
}

func (c *RoutedMacroClient) selectClient(pair gct.Pair) (routedMacroClient, error) {
	base := strings.ToUpper(strings.TrimSpace(pair.Base))
	for prefix, client := range c.prefixClients {
		if strings.HasPrefix(base, prefix) {
			if client == nil {
				return nil, fmt.Errorf("%s macro client unavailable", strings.ToLower(strings.TrimSuffix(prefix, "_")))
			}
			return client, nil
		}
	}
	if c.defaultClient == nil {
		return nil, fmt.Errorf("macro client unavailable")
	}
	return c.defaultClient, nil
}
