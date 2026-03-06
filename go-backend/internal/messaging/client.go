package messaging

// Client manages the NATS connection lifecycle.
// It is the single point of connect/drain/reconnect for the gateway.
//
// STUB — Phase B (P3.8): Implement when Rust consumer needs NATS subscriber.
// Until then, connection lifecycle is handled directly in NATSPublisher.
//
// Planned responsibilities:
//   - Connect to NATS with exponential-backoff reconnect
//   - Expose a JetStream context shared by Publisher + Subscriber
//   - Drain all pending publishes on gateway shutdown (called from main.go defer)
//   - Health-check endpoint: BackendName() + IsConnected()
//
// Usage (future):
//
//	client, err := messaging.NewClient(url)
//	publisher := messaging.NewNATSPublisherFromClient(client)
//	subscriber := messaging.NewSubscriber(client, handler)
type Client struct{}

// NewClient is a stub. Not yet implemented.
// func NewClient(url string) (*Client, error)
