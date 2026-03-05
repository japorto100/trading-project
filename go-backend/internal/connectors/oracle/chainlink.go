// Package oracle provides G10 Oracle provider scaffolds. Phase 14h.1.
// Chainlink, Pyth, Stork, Chronicle, SEDA, Switchboard, DIA.
package oracle

import (
	"context"

	"tradeviewfusion/go-backend/internal/connectors/base"
)

type ChainlinkClient struct{}

func NewChainlinkClient() *ChainlinkClient {
	return &ChainlinkClient{}
}

func (c *ChainlinkClient) GetQuote(ctx context.Context, symbol string) (*base.OracleQuote, error) {
	_ = symbol
	return nil, &base.ErrOracleNotImplemented{Provider: "chainlink"}
}
