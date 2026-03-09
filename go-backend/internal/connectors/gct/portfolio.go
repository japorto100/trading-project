package gct

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/thrasher-corp/gocryptotrader/exchanges/asset"
	gctrpc "github.com/thrasher-corp/gocryptotrader/gctrpc"
	"google.golang.org/grpc/codes"
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
func (c *Client) GetAccountInfo(ctx context.Context, exchange string, assetType asset.Item) (AccountInfo, error) {
	if c.cfg.PreferGRPC {
		info, err := c.getAccountInfoGRPC(ctx, exchange, assetType)
		if err == nil {
			return info, nil
		}
		if !shouldFallbackFromGRPC(err) {
			return AccountInfo{}, err
		}
	}

	body := map[string]any{
		"exchange":  exchange,
		"assetType": assetType.String(),
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
	if c.cfg.PreferGRPC {
		exchanges, err := c.getExchangesGRPC(ctx)
		if err == nil {
			return exchanges, nil
		}
		if !shouldFallbackFromGRPC(err) {
			return nil, err
		}
	}

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

func (c *Client) getAccountInfoGRPC(ctx context.Context, exchange string, assetType asset.Item) (AccountInfo, error) {
	serviceClient, err := c.grpcServiceClient(ctx)
	if err != nil {
		return AccountInfo{}, err
	}

	requestContext, cancel := c.withTimeout(ctx)
	defer cancel()

	response, callErr := serviceClient.GetAccountBalances(requestContext, &gctrpc.GetAccountBalancesRequest{
		Exchange:  exchange,
		AssetType: strings.ToLower(assetType.String()),
	})
	if callErr != nil {
		return AccountInfo{}, wrapRPCError("GetAccountBalances", callErr)
	}
	return fromGRPCAccountInfo(response), nil
}

func (c *Client) getExchangesGRPC(ctx context.Context) ([]ExchangeInfo, error) {
	serviceClient, err := c.grpcServiceClient(ctx)
	if err != nil {
		return nil, err
	}

	requestContext, cancel := c.withTimeout(ctx)
	defer cancel()

	response, callErr := serviceClient.GetExchanges(requestContext, &gctrpc.GetExchangesRequest{Enabled: true})
	if callErr != nil {
		return nil, wrapRPCError("GetExchanges", callErr)
	}
	return fromGRPCExchanges(response), nil
}

func fromGRPCAccountInfo(response *gctrpc.GetAccountBalancesResponse) AccountInfo {
	if response == nil {
		return AccountInfo{}
	}

	info := AccountInfo{Exchange: response.GetExchange()}
	for _, subAcc := range response.GetAccounts() {
		acc := ExchangeAccount{ID: subAcc.GetId()}
		for _, cur := range subAcc.GetCurrencies() {
			available := cur.GetFree()
			if available <= 0 {
				available = cur.GetTotalValue() - cur.GetHold()
			}
			if cur.GetFreeWithoutBorrow() > 0 {
				available = cur.GetFreeWithoutBorrow()
			}
			acc.Currencies = append(acc.Currencies, CurrencyBalance{
				Currency:          cur.GetCurrency(),
				Total:             cur.GetTotalValue(),
				Hold:              cur.GetHold(),
				Available:         available,
				FreeWithoutBorrow: cur.GetFreeWithoutBorrow(),
			})
		}
		info.Accounts = append(info.Accounts, acc)
	}
	return info
}

func fromGRPCExchanges(response *gctrpc.GetExchangesResponse) []ExchangeInfo {
	if response == nil {
		return nil
	}

	names := strings.Split(response.GetExchanges(), ",")
	exchanges := make([]ExchangeInfo, 0, len(names))
	for _, name := range names {
		trimmed := strings.TrimSpace(name)
		if trimmed == "" {
			continue
		}
		exchanges = append(exchanges, ExchangeInfo{Name: trimmed})
	}
	return exchanges
}

func shouldFallbackFromGRPC(err error) bool {
	var rpcError *RPCError
	if !errors.As(err, &rpcError) {
		return false
	}

	switch rpcError.Code {
	case codes.Unimplemented, codes.Unavailable, codes.DeadlineExceeded:
		return true
	default:
		return false
	}
}
