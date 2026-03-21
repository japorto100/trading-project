package market

import (
	"context"
	"errors"
	"testing"

	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
	"tradeviewfusion/go-backend/internal/connectors/gct"
	connectorregistry "tradeviewfusion/go-backend/internal/connectors/registry"
	"tradeviewfusion/go-backend/internal/router/adaptive"
)

type fakeMacroHistoryClient struct {
	points    []gct.SeriesPoint
	err       error
	lastPair  gct.Pair
	lastAsset asset.Item
}

func (f *fakeMacroHistoryClient) GetSeries(_ context.Context, pair currency.Pair, assetType asset.Item, _ int) ([]gct.SeriesPoint, error) {
	f.lastPair = pair
	f.lastAsset = assetType
	return f.points, f.err
}

type fakeForexHistoryClient struct {
	points []gct.SeriesPoint
	err    error
}

func (f *fakeForexHistoryClient) GetSeries(_ context.Context, _ currency.Pair, _ int) ([]gct.SeriesPoint, error) {
	return f.points, f.err
}

func TestMacroService_History_Fred(t *testing.T) {
	service := NewMacroService(
		&fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 3.2}}},
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "FRED", currency.NewPair(currency.NewCode("CPIAUCSL"), currency.NewCode("USD")), "macro", 30)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
}

func TestMacroService_History_ECB(t *testing.T) {
	service := NewMacroService(
		&fakeMacroHistoryClient{},
		&fakeForexHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 1.1}}},
	)

	points, err := service.History(context.Background(), "ECB", currency.NewPair(currency.NewCode("EUR"), currency.NewCode("USD")), "forex", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
}

func TestMacroService_History_BojPolicyAlias(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 0.1}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "BOJ", currency.NewPair(currency.NewCode("POLICY_RATE"), currency.NewCode("USD")), "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base.String() != DefaultBojPolicySeries {
		t.Fatalf("expected BOJ policy alias %s, got %s", DefaultBojPolicySeries, macro.lastPair.Base)
	}
}

func TestMacroService_History_BcbPolicyAlias(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 13.25}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "BCB", currency.NewPair(currency.NewCode("POLICY_RATE"), currency.NewCode("USD")), "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base.String() != DefaultBcbPolicySeries {
		t.Fatalf("expected BCB policy alias %s, got %s", DefaultBcbPolicySeries, macro.lastPair.Base)
	}
}

func TestMacroService_History_BanxicoSeriesPrefix(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 20.25}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "BANXICO", currency.NewPair(currency.NewCode("SF43718"), currency.NewCode("USD")), "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base.String() != "BANXICO_SF43718" {
		t.Fatalf("expected Banxico series prefix, got %s", macro.lastPair.Base)
	}
}

func TestMacroService_History_BokPolicyAlias(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 3.5}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "BOK", currency.NewPair(currency.NewCode("POLICY_RATE"), currency.NewCode("USD")), "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base.String() != DefaultBokPolicySeries {
		t.Fatalf("expected BOK policy alias %s, got %s", DefaultBokPolicySeries, macro.lastPair.Base)
	}
}

func TestMacroService_History_BcraPolicyAlias(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 29.0}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "BCRA", currency.NewPair(currency.NewCode("POLICY_RATE"), currency.NewCode("USD")), "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base.String() != DefaultBcraPolicySeries {
		t.Fatalf("expected BCRA policy alias %s, got %s", DefaultBcraPolicySeries, macro.lastPair.Base)
	}
}

func TestMacroService_History_TcmbSeriesPrefix(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 211784.46}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "TCMB", currency.NewPair(currency.NewCode("TP_AB_TOPLAM"), currency.NewCode("USD")), "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base.String() != "TCMB_EVDS_TP_AB_TOPLAM" {
		t.Fatalf("expected TCMB series prefix, got %s", macro.lastPair.Base)
	}
}

func TestMacroService_History_RbiSeriesPrefix(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 7.1025e11}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "RBI", currency.NewPair(currency.NewCode("FXRES_TR_USD_W"), currency.NewCode("USD")), "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base.String() != "RBI_DBIE_FXRES_TR_USD_WEEKLY" {
		t.Fatalf("expected RBI series prefix, got %s", macro.lastPair.Base)
	}
}

func TestMacroService_History_OfrSeriesPrefix(t *testing.T) {
	macro := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 1.23}}}
	service := NewMacroService(
		macro,
		&fakeForexHistoryClient{},
	)

	points, err := service.History(context.Background(), "OFR", currency.NewPair(currency.NewCode("FSI"), currency.NewCode("USD")), "macro", 10)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base.String() != "OFR_FSI" {
		t.Fatalf("expected OFR series prefix, got %s", macro.lastPair.Base)
	}
}

func TestMacroService_History_AutoMacroUsesAdaptiveCandidates(t *testing.T) {
	macro := &fakeMacroHistoryClient{
		points: []gct.SeriesPoint{{Timestamp: 1, Value: 3.2}},
		err:    nil,
	}
	service := NewMacroService(macro, &fakeForexHistoryClient{})
	router := adaptive.New(adaptive.Config{
		AssetClasses: map[string]adaptive.AssetClassConfig{
			"macro": {Providers: []string{"fred", "bcb"}, Strategy: "authority_first"},
		},
		Providers: map[string]adaptive.ProviderConfig{
			"fred": {Group: "timeseries"},
			"bcb":  {Group: "timeseries"},
		},
	})
	service.SetAdaptiveRouter(router)

	points, err := service.History(context.Background(), "AUTO", currency.NewPair(currency.NewCode("CPIAUCSL"), currency.NewCode("USD")), "macro", 30)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if macro.lastPair.Base.String() != "CPIAUCSL" {
		t.Fatalf("expected FRED-resolved base CPIAUCSL, got %s", macro.lastPair.Base)
	}
}

func TestMacroService_History_AutoMacroFallsBackAndRecordsFailure(t *testing.T) {
	router := adaptive.New(adaptive.Config{
		AssetClasses: map[string]adaptive.AssetClassConfig{
			"macro": {Providers: []string{"fred", "bcb"}, Strategy: "authority_first"},
		},
		Groups: map[string]connectorregistry.GroupConfig{
			"timeseries": {MaxConcurrency: 1, RetryProfile: "authority_read"},
		},
		Providers: map[string]adaptive.ProviderConfig{
			"fred": {Group: "timeseries"},
			"bcb":  {Group: "timeseries"},
		},
	})

	callCount := 0
	failing := &fakeMacroHistoryClient{err: errors.New("fred down")}
	success := &fakeMacroHistoryClient{points: []gct.SeriesPoint{{Timestamp: 1, Value: 13.25}}}
	service := NewMacroService(&macroFallbackMux{clients: []macroHistoryClient{failing, success}, onCall: func() { callCount++ }}, &fakeForexHistoryClient{})
	service.SetAdaptiveRouter(router)

	points, err := service.History(context.Background(), "AUTO", currency.NewPair(currency.NewCode("POLICY_RATE"), currency.NewCode("USD")), "macro", 30)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(points) != 1 {
		t.Fatalf("expected 1 point, got %d", len(points))
	}
	if callCount != 2 {
		t.Fatalf("expected two provider attempts, got %d", callCount)
	}

	snapshot := router.Snapshot()
	if len(snapshot) == 0 {
		t.Fatal("expected adaptive router snapshot entries")
	}
	var fredFailures int
	var bcbSuccesses int
	for _, state := range snapshot {
		switch state.Name {
		case "fred":
			fredFailures = state.Failures
		case "bcb":
			bcbSuccesses = state.Successes
		}
	}
	if fredFailures != 1 {
		t.Fatalf("expected fred failure to be recorded once, got %d", fredFailures)
	}
	if bcbSuccesses != 1 {
		t.Fatalf("expected bcb success to be recorded once, got %d", bcbSuccesses)
	}
}

type macroFallbackMux struct {
	clients []macroHistoryClient
	index   int
	onCall  func()
}

func (m *macroFallbackMux) GetSeries(ctx context.Context, pair currency.Pair, assetType asset.Item, limit int) ([]gct.SeriesPoint, error) {
	if m.onCall != nil {
		m.onCall()
	}
	client := m.clients[m.index]
	if m.index < len(m.clients)-1 {
		m.index++
	}
	return client.GetSeries(ctx, pair, assetType, limit)
}
