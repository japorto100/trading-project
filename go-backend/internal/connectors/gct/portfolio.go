package gct

// TODO(Phase 5a open): gRPC paths for GetAccountInfo and GetExchanges are not
// implemented here because the compiled gctrpc.GoCryptoTraderServiceClient stub
// (vendor-forks/gocryptotrader/gctrpc) does not expose those methods in the
// generated proto client.  When upgrading GCT or regenerating the proto stubs,
// add getAccountInfoGRPC / getExchangesGRPC methods analogous to getTickerGRPC
// and re-enable them behind the existing c.cfg.PreferGRPC guard.
// Tracked in EXECUTION_PLAN.md Phase 5a open backlog.

import (
	"context"
	"fmt"
)

// CurrencyBalance holds balance data for a single currency on an exchange.
type CurrencyBalance struct {
	Currency          string  `json:"currency"`
	Total             float64 `json:"total"`
	Hold              float64 `json:"hold"`
	Available         float64 `json:"available"`
	FreeWithoutBorrow float64 `json:"freeWithoutBorrow"`
}

// ExchangeAccount groups balances for one exchange sub-account.
type ExchangeAccount struct {
	ID         string            `json:"id"`
	Currencies []CurrencyBalance `json:"currencies"`
}

// AccountInfo is the full account info response for one exchange.
type AccountInfo struct {
	Exchange string            `json:"exchange"`
	Accounts []ExchangeAccount `json:"accounts"`
}

// ExchangeInfo describes one enabled exchange.
type ExchangeInfo struct {
	Name       string   `json:"name"`
	AssetTypes []string `json:"assetTypes"`
}

// GetAccountInfo fetches live balance data for the given exchange via GCT JSON-RPC.
func (c *Client) GetAccountInfo(ctx context.Context, exchange, assetType string) (AccountInfo, error) {
	body := map[string]any{
		"exchange":  exchange,
		"assetType": assetType,
	}

	var raw struct {
		Exchange string `json:"exchange"`
		Accounts []struct {
			ID         string `json:"id"`
			Currencies []struct {
				CurrencyName           string  `json:"currencyName"`
				TotalValue             float64 `json:"totalValue"`
				Hold                   float64 `json:"hold"`
				AvailableWithoutBorrow float64 `json:"availableWithoutBorrow"`
			} `json:"currencies"`
		} `json:"accounts"`
	}

	if err := c.postJSON(ctx, "/v1/getaccountinfo", body, &raw); err != nil {
		return AccountInfo{}, err
	}

	info := AccountInfo{Exchange: raw.Exchange}
	for _, subAcc := range raw.Accounts {
		acc := ExchangeAccount{ID: subAcc.ID}
		for _, cur := range subAcc.Currencies {
			available := cur.TotalValue - cur.Hold
			if cur.AvailableWithoutBorrow > 0 {
				available = cur.AvailableWithoutBorrow
			}
			acc.Currencies = append(acc.Currencies, CurrencyBalance{
				Currency:          cur.CurrencyName,
				Total:             cur.TotalValue,
				Hold:              cur.Hold,
				Available:         available,
				FreeWithoutBorrow: cur.AvailableWithoutBorrow,
			})
		}
		info.Accounts = append(info.Accounts, acc)
	}
	return info, nil
}

// GetExchanges returns the list of enabled exchanges from GCT via JSON-RPC.
func (c *Client) GetExchanges(ctx context.Context) ([]ExchangeInfo, error) {
	var raw struct {
		Exchanges []struct {
			Name       string   `json:"name"`
			AssetTypes []string `json:"assetTypes"`
		} `json:"exchanges"`
	}

	if err := c.postJSON(ctx, "/v1/getexchanges", map[string]any{}, &raw); err != nil {
		return nil, fmt.Errorf("getexchanges: %w", err)
	}

	exchanges := make([]ExchangeInfo, 0, len(raw.Exchanges))
	for _, e := range raw.Exchanges {
		exchanges = append(exchanges, ExchangeInfo{Name: e.Name, AssetTypes: e.AssetTypes})
	}
	return exchanges, nil
}
