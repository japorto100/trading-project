// Package observability provides opt-in runtime diagnostics for the Go gateway.
// FlightRecorder wraps runtime/trace.FlightRecorder for continuous low-overhead
// Go-runtime tracing (goroutine scheduling, GC, blocking events).
// Complements OTel distributed tracing — use go tool trace to analyze dumps.
// Enable via FLIGHT_RECORDER_ENABLED=true; dump at GET /debug/flight-recorder.
package observability

import (
	"fmt"
	"net/http"
	"runtime/trace"
	"sync"
	"time"
)

// FlightRecorder wraps runtime/trace.FlightRecorder.
// Start is idempotent and safe to call from wiring.go.
// HTTPHandler dumps the current trace ring buffer as a downloadable .trace file.
type FlightRecorder struct {
	fr   *trace.FlightRecorder
	once sync.Once
}

// NewFlightRecorder creates a FlightRecorder retaining at least 10 seconds of
// Go-runtime trace data in its ring buffer.
func NewFlightRecorder() *FlightRecorder {
	fr := trace.NewFlightRecorder(trace.FlightRecorderConfig{
		MinAge: 10 * time.Second,
	})
	return &FlightRecorder{fr: fr}
}

// Start activates the flight recorder. All calls after the first are no-ops.
func (f *FlightRecorder) Start() error {
	var startErr error
	f.once.Do(func() {
		startErr = f.fr.Start()
	})
	if startErr != nil {
		return fmt.Errorf("start flight recorder: %w", startErr)
	}
	return nil
}

// HTTPHandler returns an http.HandlerFunc that dumps the current trace buffer
// as application/octet-stream. Analyze with: go tool trace flight.trace
func (f *FlightRecorder) HTTPHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/octet-stream")
		w.Header().Set("Content-Disposition", `attachment; filename="flight.trace"`)
		if _, err := f.fr.WriteTo(w); err != nil {
			http.Error(w, "trace write failed: "+err.Error(), http.StatusInternalServerError)
		}
	}
}
