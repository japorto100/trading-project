package oracle

import (
	"context"

	"tradeviewfusion/go-backend/internal/connectors/base"
)

type PythClient struct{}

func NewPythClient() *PythClient {
	return &PythClient{}
}

func (c *PythClient) GetQuote(ctx context.Context, symbol string) (*base.OracleQuote, error) {
	_ = symbol
	return nil, &base.ErrOracleNotImplemented{Provider: "pyth"}
}
