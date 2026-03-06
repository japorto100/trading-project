package duplex

// OrderRequest is the canonical order payload sent to an ExchangeAdapter.
type OrderRequest struct {
	Symbol    string  `json:"symbol"`
	Side      string  `json:"side"`              // "buy" | "sell"
	Type      string  `json:"type"`              // "market" | "limit" | "stop"
	Quantity  float64 `json:"quantity"`
	Price     float64 `json:"price,omitempty"`     // required for limit orders
	StopPrice float64 `json:"stopPrice,omitempty"` // required for stop orders
	ClientID  string  `json:"clientId,omitempty"`  // optional idempotency key
}

// OrderResponse is returned by an ExchangeAdapter after order submission.
type OrderResponse struct {
	OrderID  string  `json:"orderId"`
	Status   string  `json:"status"`              // "open" | "filled" | "rejected"
	FilledAt float64 `json:"filledAt,omitempty"`
	Message  string  `json:"message,omitempty"`
}
