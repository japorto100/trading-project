package gct

import (
	"strings"

	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
)

// IsSemanticAssetType accepts connector-level semantic labels (macro/forex/equity)
// and treats an empty asset.Item as a compatibility fallback.
func IsSemanticAssetType(assetType asset.Item, expected string) bool {
	label := strings.ToLower(strings.TrimSpace(assetType.String()))
	expected = strings.ToLower(strings.TrimSpace(expected))
	if expected == "" {
		return label == ""
	}
	if label == expected {
		return true
	}
	return label == ""
}
