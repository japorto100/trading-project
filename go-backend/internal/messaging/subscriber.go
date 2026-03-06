package messaging

// Subscriber wraps a NATS JetStream consumer with automatic reconnect and
// context-aware shutdown. It is the receive-side counterpart to Publisher.
//
// STUB — Phase B (P3.8): Implement when:
//   - Rust Signal Processor publishes to "signals.*.computed"
//   - Go SSE Handler subscribes from NATS instead of directly from Exchange (Phase D, P3.12)
//
// Planned API:
//
//	type Handler func(subject string, payload []byte) error
//
//	type Subscriber struct { ... }
//
//	func NewSubscriber(client *Client, subject string, handler Handler) (*Subscriber, error)
//	func (s *Subscriber) Start(ctx context.Context) error   // blocks until ctx cancelled
//	func (s *Subscriber) Stop() error                       // drain + unsubscribe
//
// Reconnect strategy:
//   - On NATS disconnect: wait for client.IsConnected(), then resubscribe
//   - DeliverLastPerSubjectPolicy: new subscriber gets last tick per symbol immediately
//   - AckExplicit: handler must return nil to ACK; non-nil triggers redelivery
//
// Subject patterns:
//   - "market.*.tick"              → raw ticks (Go publishes)
//   - "signals.*.computed"         → Rust-computed indicators (Phase B)
//   - "signals.*.ml_features"      → Python-ready features (Phase C)
type Subscriber struct{}
