package market

import (
	"strings"

	"tradeviewfusion/go-backend/internal/contracts"

	"github.com/thrasher-corp/gocryptotrader/currency"
	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
)

func normalizeMarketTarget(target contracts.MarketTarget) (string, currency.Pair, asset.Item) {
	normalized := target.Normalized()
	pair := currency.NewPair(
		currency.NewCode(strings.TrimSpace(normalized.Pair.Base)),
		currency.NewCode(strings.TrimSpace(normalized.Pair.Quote)),
	)
	item, err := asset.New(strings.TrimSpace(normalized.AssetType))
	if err != nil {
		item = asset.Empty
	}
	return normalized.Exchange, pair, item
}
