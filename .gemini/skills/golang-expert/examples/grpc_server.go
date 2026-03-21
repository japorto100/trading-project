package examples

import (
	"context"
	"log/slog"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type GetUserRequest struct {
	ID string
}

type GetUserResponse struct {
	ID    string
	Email string
}

type UserServer struct{}

func (s *UserServer) GetUser(ctx context.Context, req *GetUserRequest) (*GetUserResponse, error) {
	if req == nil || req.ID == "" {
		return nil, status.Error(codes.InvalidArgument, "missing user id")
	}

	return &GetUserResponse{
		ID:    req.ID,
		Email: "user@example.com",
	}, nil
}

// LoggingInterceptor provides structured logging for every gRPC call.
func LoggingInterceptor(
	ctx context.Context,
	req any,
	info *grpc.UnaryServerInfo,
	handler grpc.UnaryHandler,
) (any, error) {
	start := time.Now()
	resp, err := handler(ctx, req)

	slog.Info("grpc call",
		"method", info.FullMethod,
		"duration", time.Since(start),
		"error", err,
	)

	return resp, err
}

func StartGRPC() *grpc.Server {
	return grpc.NewServer(
		grpc.UnaryInterceptor(LoggingInterceptor),
	)
}
