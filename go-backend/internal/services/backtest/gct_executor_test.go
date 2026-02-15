package backtest

import (
	"context"
	"testing"
	"time"

	"github.com/thrasher-corp/gocryptotrader/backtester/btrpc"
	"google.golang.org/grpc"
)

type fakeBacktesterClient struct {
	executeResp *btrpc.ExecuteStrategyResponse
	executeErr  error
	startResp   *btrpc.StartTaskResponse
	startErr    error
	listResp    []*btrpc.ListAllTasksResponse
	listErr     error
	listCalls   int
}

func (f *fakeBacktesterClient) ExecuteStrategyFromFile(_ context.Context, _ *btrpc.ExecuteStrategyFromFileRequest, _ ...grpc.CallOption) (*btrpc.ExecuteStrategyResponse, error) {
	if f.executeErr != nil {
		return nil, f.executeErr
	}
	return f.executeResp, nil
}

func (f *fakeBacktesterClient) StartTask(_ context.Context, _ *btrpc.StartTaskRequest, _ ...grpc.CallOption) (*btrpc.StartTaskResponse, error) {
	if f.startErr != nil {
		return nil, f.startErr
	}
	return f.startResp, nil
}

func (f *fakeBacktesterClient) ListAllTasks(_ context.Context, _ *btrpc.ListAllTasksRequest, _ ...grpc.CallOption) (*btrpc.ListAllTasksResponse, error) {
	if f.listErr != nil {
		return nil, f.listErr
	}
	if len(f.listResp) == 0 {
		return &btrpc.ListAllTasksResponse{}, nil
	}
	index := f.listCalls
	if index >= len(f.listResp) {
		index = len(f.listResp) - 1
	}
	f.listCalls++
	return f.listResp[index], nil
}

func TestGCTExecutorExecuteCompletes(t *testing.T) {
	executor, err := NewGCTExecutor(GCTExecutorConfig{
		Address:      "127.0.0.1:9054",
		PollInterval: 5 * time.Millisecond,
	})
	if err != nil {
		t.Fatalf("new executor: %v", err)
	}
	executor.grpcClient = &fakeBacktesterClient{
		executeResp: &btrpc.ExecuteStrategyResponse{
			Task: &btrpc.TaskSummary{Id: "task-123"},
		},
		startResp: &btrpc.StartTaskResponse{Started: true},
		listResp: []*btrpc.ListAllTasksResponse{
			{Tasks: []*btrpc.TaskSummary{{Id: "task-123", Closed: false}}},
			{Tasks: []*btrpc.TaskSummary{{Id: "task-123", Closed: true}}},
		},
	}

	outcome, execErr := executor.Execute(context.Background(), RunRequest{
		Strategy:  "demo.strat",
		Symbol:    "BTC/USDT",
		Exchange:  "binance",
		AssetType: "spot",
	}, "C:\\strategies\\demo.strat")
	if execErr != nil {
		t.Fatalf("execute: %v", execErr)
	}
	if outcome.UpstreamTaskID != "task-123" {
		t.Fatalf("unexpected upstream task id: %s", outcome.UpstreamTaskID)
	}
}

func TestGCTExecutorExecuteFailsWhenStartDeclined(t *testing.T) {
	executor, err := NewGCTExecutor(GCTExecutorConfig{
		Address:      "127.0.0.1:9054",
		PollInterval: 5 * time.Millisecond,
	})
	if err != nil {
		t.Fatalf("new executor: %v", err)
	}
	executor.grpcClient = &fakeBacktesterClient{
		executeResp: &btrpc.ExecuteStrategyResponse{
			Task: &btrpc.TaskSummary{Id: "task-123"},
		},
		startResp: &btrpc.StartTaskResponse{Started: false},
	}

	_, execErr := executor.Execute(context.Background(), RunRequest{
		Strategy:  "demo.strat",
		Symbol:    "BTC/USDT",
		Exchange:  "binance",
		AssetType: "spot",
	}, "C:\\strategies\\demo.strat")
	if execErr == nil {
		t.Fatal("expected start declined error")
	}
}

func TestGCTExecutorExecuteHonorsContext(t *testing.T) {
	executor, err := NewGCTExecutor(GCTExecutorConfig{
		Address:      "127.0.0.1:9054",
		PollInterval: 5 * time.Millisecond,
	})
	if err != nil {
		t.Fatalf("new executor: %v", err)
	}
	executor.grpcClient = &fakeBacktesterClient{
		executeResp: &btrpc.ExecuteStrategyResponse{
			Task: &btrpc.TaskSummary{Id: "task-123"},
		},
		startResp: &btrpc.StartTaskResponse{Started: true},
		listResp: []*btrpc.ListAllTasksResponse{
			{Tasks: []*btrpc.TaskSummary{{Id: "task-123", Closed: false}}},
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Millisecond)
	defer cancel()

	_, execErr := executor.Execute(ctx, RunRequest{
		Strategy:  "demo.strat",
		Symbol:    "BTC/USDT",
		Exchange:  "binance",
		AssetType: "spot",
	}, "C:\\strategies\\demo.strat")
	if execErr == nil {
		t.Fatal("expected timeout error")
	}
}
