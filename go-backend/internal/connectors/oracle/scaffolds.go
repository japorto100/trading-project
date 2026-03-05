package oracle

import (
	"context"

	"tradeviewfusion/go-backend/internal/connectors/base"
)

type StorkClient struct{}

func NewStorkClient() *StorkClient { return &StorkClient{} }

func (c *StorkClient) GetQuote(ctx context.Context, symbol string) (*base.OracleQuote, error) {
	_ = symbol
	return nil, &base.ErrOracleNotImplemented{Provider: "stork"}
}

type ChronicleClient struct{}

func NewChronicleClient() *ChronicleClient { return &ChronicleClient{} }

func (c *ChronicleClient) GetQuote(ctx context.Context, symbol string) (*base.OracleQuote, error) {
	_ = symbol
	return nil, &base.ErrOracleNotImplemented{Provider: "chronicle"}
}

type SEDAClient struct{}

func NewSEDAClient() *SEDAClient { return &SEDAClient{} }

func (c *SEDAClient) GetQuote(ctx context.Context, symbol string) (*base.OracleQuote, error) {
	_ = symbol
	return nil, &base.ErrOracleNotImplemented{Provider: "seda"}
}

type SwitchboardClient struct{}

func NewSwitchboardClient() *SwitchboardClient { return &SwitchboardClient{} }

func (c *SwitchboardClient) GetQuote(ctx context.Context, symbol string) (*base.OracleQuote, error) {
	_ = symbol
	return nil, &base.ErrOracleNotImplemented{Provider: "switchboard"}
}

type DIAClient struct{}

func NewDIAClient() *DIAClient { return &DIAClient{} }

func (c *DIAClient) GetQuote(ctx context.Context, symbol string) (*base.OracleQuote, error) {
	_ = symbol
	return nil, &base.ErrOracleNotImplemented{Provider: "dia"}
}
