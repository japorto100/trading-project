package examples

import (
	"context"
	"fmt"
	"log/slog"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

type UserStore interface {
	Load(ctx context.Context, id string) error
}

func LoadUserWithTracing(ctx context.Context, logger *slog.Logger, store UserStore, userID string) error {
	tracer := otel.Tracer("golang-expert/examples")
	ctx, span := tracer.Start(ctx, "user.load", trace.WithAttributes(
		attribute.String("user.id", userID),
	))
	defer span.End()

	logger.InfoContext(ctx, "loading user", "userId", userID)

	if err := store.Load(ctx, userID); err != nil {
		wrapped := fmt.Errorf("load user %q: %w", userID, err)
		span.RecordError(wrapped)
		span.SetStatus(codes.Error, wrapped.Error())
		logger.ErrorContext(ctx, "user load failed", "userId", userID, "error", wrapped)
		return wrapped
	}

	logger.InfoContext(ctx, "user load complete", "userId", userID)
	return nil
}
