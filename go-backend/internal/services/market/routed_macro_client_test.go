package market

import (
	"context"
	"errors"
	"testing"

	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
	"tradeviewfusion/go-backend/internal/connectors/gct"
)

type fakeRoutedMacroClient struct {
	label        string
	lastPair     gct.Pair
	lastAsset    asset.Item
	lastLimit    int
	seriesPoints []gct.SeriesPoint
	ticker       gct.Ticker
	err          error
}

func (f *fakeRoutedMacroClient) GetTicker(_ context.Context, pair currency.Pair, assetType asset.Item) (gct.Ticker, error) {
	f.lastPair = pair
	f.lastAsset = assetType
	if f.err != nil {
		return gct.Ticker{}, f.err
	}
	if f.ticker.Currency == "" {
		f.ticker.Currency = f.label
	}
	return f.ticker, nil
}

func (f *fakeRoutedMacroClient) GetSeries(_ context.Context, pair currency.Pair, assetType asset.Item, limit int) ([]gct.SeriesPoint, error) {
	f.lastPair = pair
	f.lastAsset = assetType
	f.lastLimit = limit
	if f.err != nil {
		return nil, f.err
	}
	return f.seriesPoints, nil
}

func TestRoutedMacroClient_RoutesBCBPrefixToBCBClient(t *testing.T) {
	defaultClient := &fakeRoutedMacroClient{label: "fred"}
	bcbClient := &fakeRoutedMacroClient{label: "bcb", seriesPoints: []gct.SeriesPoint{{Timestamp: 1, Value: 1}}}
	client := NewRoutedMacroClient(defaultClient, bcbClient)

	points, err := client.GetSeries(context.Background(), currency.NewPair(currency.NewCode("BCB_SGS_432"), currency.NewCode("USD")), asset.Empty, 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if bcbClient.lastPair.Base.String() != "BCB_SGS_432" {
		t.Fatalf("expected BCB client to receive BCB pair, got %s", bcbClient.lastPair.Base)
	}
	if defaultClient.lastPair.Base.String() != "" {
		t.Fatalf("expected default client not called")
	}
}

func TestRoutedMacroClient_RoutesNonBCBToDefaultClient(t *testing.T) {
	defaultClient := &fakeRoutedMacroClient{label: "fred", ticker: gct.Ticker{Last: 3.2}}
	bcbClient := &fakeRoutedMacroClient{label: "bcb"}
	client := NewRoutedMacroClient(defaultClient, bcbClient)

	_, err := client.GetTicker(context.Background(), currency.NewPair(currency.NewCode("FEDFUNDS"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if defaultClient.lastPair.Base.String() != "FEDFUNDS" {
		t.Fatalf("expected default client to receive FED pair, got %s", defaultClient.lastPair.Base)
	}
}

func TestRoutedMacroClient_ErrorsWhenBCBClientMissingAndNoDefault(t *testing.T) {
	client := NewRoutedMacroClient(nil, nil)
	_, err := client.GetTicker(context.Background(), currency.NewPair(currency.NewCode("BCB_SGS_432"), currency.NewCode("USD")), asset.Empty)
	if err == nil {
		t.Fatal("expected error when BCB client missing")
	}
}

func TestRoutedMacroClient_PropagatesUnderlyingError(t *testing.T) {
	wantErr := errors.New("upstream")
	client := NewRoutedMacroClient(&fakeRoutedMacroClient{err: wantErr}, nil)
	_, err := client.GetSeries(context.Background(), currency.NewPair(currency.NewCode("FEDFUNDS"), currency.NewCode("USD")), asset.Empty, 1)
	if !errors.Is(err, wantErr) {
		t.Fatalf("expected propagated error, got %v", err)
	}
}

func TestRoutedMacroClient_RoutesRegisteredPrefixClient(t *testing.T) {
	defaultClient := &fakeRoutedMacroClient{label: "fred"}
	banxicoClient := &fakeRoutedMacroClient{label: "banxico", ticker: gct.Ticker{Last: 20.25}}
	client := NewRoutedMacroClient(defaultClient, nil)
	client.RegisterPrefixClient("BANXICO_", banxicoClient)

	_, err := client.GetTicker(context.Background(), currency.NewPair(currency.NewCode("BANXICO_SF43718"), currency.NewCode("USD")), asset.Empty)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if banxicoClient.lastPair.Base.String() != "BANXICO_SF43718" {
		t.Fatalf("expected Banxico client to receive prefixed pair, got %s", banxicoClient.lastPair.Base)
	}
	if defaultClient.lastPair.Base.String() != "" {
		t.Fatalf("expected default client not called")
	}
}
