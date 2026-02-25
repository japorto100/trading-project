package base

type Capabilities struct {
	Quote           bool `json:"quote,omitempty"`
	BatchQuote      bool `json:"batchQuote,omitempty"`
	OHLCV           bool `json:"ohlcv,omitempty"`
	Search          bool `json:"search,omitempty"`
	News            bool `json:"news,omitempty"`
	Streaming       bool `json:"streaming,omitempty"`
	OrderPlacement  bool `json:"orderPlacement,omitempty"`
	OrderStatus     bool `json:"orderStatus,omitempty"`
	Backfill        bool `json:"backfill,omitempty"`
	RequiresAPIKey  bool `json:"requiresApiKey,omitempty"`
	SupportsSandbox bool `json:"supportsSandbox,omitempty"`
}

func (c Capabilities) SupportsRealtime() bool {
	return c.Streaming || c.Quote || c.BatchQuote
}

func (c Capabilities) SupportsAnalyticsSeed() bool {
	return c.OHLCV || c.News
}

type ProviderDescriptor struct {
	Name         string       `json:"name"`
	Group        string       `json:"group,omitempty"`
	Kind         string       `json:"kind,omitempty"`
	Capabilities Capabilities `json:"capabilities,omitempty"`
}
