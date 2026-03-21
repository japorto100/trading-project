package market

import (
	"context"
	"fmt"
	"strings"

	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
	"tradeviewfusion/go-backend/internal/connectors/gct"
)

type routedMacroClient interface {
	GetTicker(ctx context.Context, pair currency.Pair, assetType asset.Item) (gct.Ticker, error)
	GetSeries(ctx context.Context, pair currency.Pair, assetType asset.Item, limit int) ([]gct.SeriesPoint, error)
}

type macroRoute struct {
	provider string
	prefix   string
	client   routedMacroClient
}

type RoutedMacroClient struct {
	defaultProvider string
	defaultClient   routedMacroClient
	prefixRoutes    []macroRoute
}

func NewRoutedMacroClient(defaultClient routedMacroClient, bcbClient routedMacroClient) *RoutedMacroClient {
	client := &RoutedMacroClient{
		defaultProvider: "fred",
		defaultClient:   defaultClient,
	}
	if bcbClient != nil {
		client.RegisterProviderPrefixClient("bcb", "BCB_SGS_", bcbClient)
	}
	return client
}

func (c *RoutedMacroClient) RegisterPrefixClient(prefix string, client routedMacroClient) {
	c.RegisterProviderPrefixClient("", prefix, client)
}

func (c *RoutedMacroClient) RegisterProviderPrefixClient(provider string, prefix string, client routedMacroClient) {
	if c == nil || client == nil {
		return
	}
	normalizedPrefix := strings.ToUpper(strings.TrimSpace(prefix))
	if normalizedPrefix == "" {
		return
	}
	normalizedProvider := strings.ToLower(strings.TrimSpace(provider))
	for index := range c.prefixRoutes {
		if c.prefixRoutes[index].prefix == normalizedPrefix {
			c.prefixRoutes[index] = macroRoute{
				provider: normalizedProvider,
				prefix:   normalizedPrefix,
				client:   client,
			}
			return
		}
	}
	c.prefixRoutes = append(c.prefixRoutes, macroRoute{
		provider: normalizedProvider,
		prefix:   normalizedPrefix,
		client:   client,
	})
}

func (c *RoutedMacroClient) ResolveProvider(pair currency.Pair) string {
	route, _ := c.selectRoute(pair)
	if route.provider != "" {
		return route.provider
	}
	return c.defaultProvider
}

func (c *RoutedMacroClient) GetTicker(ctx context.Context, pair currency.Pair, assetType asset.Item) (gct.Ticker, error) {
	route, err := c.selectRoute(pair)
	if err != nil {
		return gct.Ticker{}, err
	}
	ticker, err := route.client.GetTicker(ctx, pair, assetType)
	if err != nil {
		return gct.Ticker{}, fmt.Errorf("get routed macro ticker for %s/%s: %w", routeName(route), pair.String(), err)
	}
	return ticker, nil
}

func (c *RoutedMacroClient) GetSeries(ctx context.Context, pair currency.Pair, assetType asset.Item, limit int) ([]gct.SeriesPoint, error) {
	route, err := c.selectRoute(pair)
	if err != nil {
		return nil, err
	}
	series, err := route.client.GetSeries(ctx, pair, assetType, limit)
	if err != nil {
		return nil, fmt.Errorf("get routed macro series for %s/%s: %w", routeName(route), pair.String(), err)
	}
	return series, nil
}

func (c *RoutedMacroClient) selectRoute(pair currency.Pair) (macroRoute, error) {
	base := strings.ToUpper(strings.TrimSpace(pair.Base.String()))
	for _, route := range c.prefixRoutes {
		if strings.HasPrefix(base, route.prefix) {
			if route.client == nil {
				return macroRoute{}, fmt.Errorf("%s macro client unavailable", routeName(route))
			}
			return route, nil
		}
	}
	if c.defaultClient == nil {
		return macroRoute{}, fmt.Errorf("macro client unavailable")
	}
	return macroRoute{
		provider: c.defaultProvider,
		client:   c.defaultClient,
	}, nil
}

func routeName(route macroRoute) string {
	if route.provider != "" {
		return route.provider
	}
	if route.prefix != "" {
		return strings.ToLower(strings.TrimSuffix(route.prefix, "_"))
	}
	return "macro"
}
