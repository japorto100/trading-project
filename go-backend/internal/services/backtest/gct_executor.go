package backtest

import (
	"context"
	"crypto/tls"
	"fmt"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/thrasher-corp/gocryptotrader/backtester/btrpc"
	gctauth "github.com/thrasher-corp/gocryptotrader/gctrpc/auth"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type GCTExecutorConfig struct {
	Address               string
	Username              string
	Password              string
	InsecureSkipVerifyTLS bool
	RequestTimeout        time.Duration
	PollInterval          time.Duration
	ReportOutputDir       string
}

type backtesterRPCClient interface {
	ExecuteStrategyFromFile(ctx context.Context, in *btrpc.ExecuteStrategyFromFileRequest, opts ...grpc.CallOption) (*btrpc.ExecuteStrategyResponse, error)
	StartTask(ctx context.Context, in *btrpc.StartTaskRequest, opts ...grpc.CallOption) (*btrpc.StartTaskResponse, error)
	ListAllTasks(ctx context.Context, in *btrpc.ListAllTasksRequest, opts ...grpc.CallOption) (*btrpc.ListAllTasksResponse, error)
}

type GCTExecutor struct {
	cfg GCTExecutorConfig

	dialMu     sync.Mutex
	grpcConn   *grpc.ClientConn
	grpcClient backtesterRPCClient
}

func NewGCTExecutor(cfg GCTExecutorConfig) (*GCTExecutor, error) {
	cfg.Address = strings.TrimSpace(cfg.Address)
	if cfg.Address == "" {
		return nil, fmt.Errorf("gct backtester address missing")
	}
	if cfg.RequestTimeout <= 0 {
		cfg.RequestTimeout = 8 * time.Second
	}
	if cfg.PollInterval <= 0 {
		cfg.PollInterval = 600 * time.Millisecond
	}
	cfg.ReportOutputDir = strings.TrimSpace(cfg.ReportOutputDir)
	if cfg.ReportOutputDir != "" {
		cfg.ReportOutputDir = filepath.Clean(cfg.ReportOutputDir)
	}
	return &GCTExecutor{cfg: cfg}, nil
}

func (e *GCTExecutor) Name() string {
	return "gct-backtester"
}

func (e *GCTExecutor) Execute(ctx context.Context, req RunRequest, strategyPath string) (ExecutionOutcome, error) {
	client, err := e.client(ctx)
	if err != nil {
		return ExecutionOutcome{}, err
	}
	startedAt := time.Now()

	execReq := &btrpc.ExecuteStrategyFromFileRequest{
		StrategyFilePath:    strategyPath,
		DoNotRunImmediately: true,
	}
	if req.StartTime > 0 {
		execReq.StartTimeOverride = timestamppb.New(time.Unix(req.StartTime, 0).UTC())
	}
	if req.EndTime > 0 {
		execReq.EndTimeOverride = timestamppb.New(time.Unix(req.EndTime, 0).UTC())
	}

	execResp, err := client.ExecuteStrategyFromFile(ctx, execReq)
	if err != nil {
		return ExecutionOutcome{}, fmt.Errorf("execute strategy from file: %w", err)
	}
	if execResp == nil {
		return ExecutionOutcome{}, fmt.Errorf("gct backtester returned empty execute response")
	}
	taskID := strings.TrimSpace(execResp.GetTask().GetId())
	if taskID == "" {
		return ExecutionOutcome{}, fmt.Errorf("gct backtester returned empty task id")
	}

	startResp, err := client.StartTask(ctx, &btrpc.StartTaskRequest{Id: taskID})
	if err != nil {
		return ExecutionOutcome{}, fmt.Errorf("start task: %w", err)
	}
	if !startResp.GetStarted() {
		return ExecutionOutcome{}, fmt.Errorf("start task declined by gct backtester")
	}

	if err := e.waitClosed(ctx, client, taskID); err != nil {
		return ExecutionOutcome{}, err
	}

	result, _ := extractGCTReportResult(e.cfg.ReportOutputDir, execResp.GetTask().GetStrategyName(), startedAt)

	return ExecutionOutcome{
		UpstreamTaskID: taskID,
		Result:         result,
	}, nil
}

func (e *GCTExecutor) waitClosed(ctx context.Context, client backtesterRPCClient, taskID string) error {
	timer := time.NewTimer(0)
	defer timer.Stop()

	for {
		select {
		case <-ctx.Done():
			return fmt.Errorf("wait for task completion: %w", ctx.Err())
		case <-timer.C:
			resp, err := client.ListAllTasks(ctx, &btrpc.ListAllTasksRequest{})
			if err != nil {
				return fmt.Errorf("list tasks: %w", err)
			}
			for _, task := range resp.GetTasks() {
				if strings.TrimSpace(task.GetId()) != taskID {
					continue
				}
				if task.GetClosed() || strings.TrimSpace(task.GetDateEnded()) != "" {
					return nil
				}
				break
			}
			timer.Reset(e.cfg.PollInterval)
		}
	}
}

func (e *GCTExecutor) client(ctx context.Context) (backtesterRPCClient, error) {
	e.dialMu.Lock()
	defer e.dialMu.Unlock()

	if e.grpcClient != nil {
		return e.grpcClient, nil
	}

	tlsConfig := &tls.Config{InsecureSkipVerify: e.cfg.InsecureSkipVerifyTLS}
	dialOptions := []grpc.DialOption{
		grpc.WithTransportCredentials(credentials.NewTLS(tlsConfig)),
	}
	if e.cfg.Username != "" || e.cfg.Password != "" {
		dialOptions = append(dialOptions, grpc.WithPerRPCCredentials(gctauth.BasicAuth{
			Username: e.cfg.Username,
			Password: e.cfg.Password,
		}))
	}

	dialCtx, cancel := e.withTimeout(ctx)
	defer cancel()

	conn, err := grpc.DialContext(dialCtx, e.cfg.Address, dialOptions...)
	if err != nil {
		return nil, fmt.Errorf("dial gct backtester: %w", err)
	}

	e.grpcConn = conn
	e.grpcClient = btrpc.NewBacktesterServiceClient(conn)
	return e.grpcClient, nil
}

func (e *GCTExecutor) withTimeout(ctx context.Context) (context.Context, context.CancelFunc) {
	if _, hasDeadline := ctx.Deadline(); hasDeadline {
		return context.WithCancel(ctx)
	}
	return context.WithTimeout(ctx, e.cfg.RequestTimeout)
}
