package app

import (
	"context"
	"crypto/rand"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/requestctx"
)

const requestIDHeader = "X-Request-ID"

type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode   int
	bytesWritten int
}

func (w *loggingResponseWriter) WriteHeader(statusCode int) {
	w.statusCode = statusCode
	w.ResponseWriter.WriteHeader(statusCode)
}

func (w *loggingResponseWriter) Write(p []byte) (int, error) {
	if w.statusCode == 0 {
		w.statusCode = http.StatusOK
	}
	n, err := w.ResponseWriter.Write(p)
	w.bytesWritten += n
	return n, err
}

func withRequestIDAndLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := strings.TrimSpace(r.Header.Get(requestIDHeader))
		if requestID == "" {
			requestID = newUUIDv4()
		}

		w.Header().Set(requestIDHeader, requestID)
		r.Header.Set(requestIDHeader, requestID)
		ctx := requestctx.WithRequestID(r.Context(), requestID)
		r = r.WithContext(ctx)

		start := time.Now()
		lrw := &loggingResponseWriter{ResponseWriter: w}
		next.ServeHTTP(lrw, r)

		statusCode := lrw.statusCode
		if statusCode == 0 {
			statusCode = http.StatusOK
		}

		slog.Info("http_request",
			"service", "go-gateway",
			"requestId", requestID,
			"method", r.Method,
			"path", r.URL.Path,
			"status", statusCode,
			"duration_ms", time.Since(start).Milliseconds(),
			"bytes", lrw.bytesWritten,
		)
	})
}

// RequestIDFromContext returns the propagated request id if middleware attached one.
func RequestIDFromContext(ctx context.Context) string {
	return requestctx.RequestID(ctx)
}

func newUUIDv4() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		// Preserve liveness; timestamp fallback only if CSPRNG fails.
		return fmt.Sprintf("req-%d", time.Now().UnixNano())
	}
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		b[0:4],
		b[4:6],
		b[6:8],
		b[8:10],
		b[10:16],
	)
}
