package orchestrator

import (
	"context"
	"errors"
	"fmt"

	"golang.org/x/sync/errgroup"
	"golang.org/x/sync/semaphore"
)

type ProviderValue[T any] struct {
	Provider string
	Value    T
}

type ProviderResult[T any] struct {
	Index    int
	Provider string
	Value    T
	Err      error
}

func ExecuteFirst[T any](ctx context.Context, planner *Planner, plan Plan, call func(context.Context, string) (T, error)) (ProviderValue[T], error) {
	var zero ProviderValue[T]
	if len(plan.Candidates) == 0 {
		return zero, fmt.Errorf("no providers configured")
	}
	if plan.ConcurrencyLimit <= 1 {
		var lastErr error
		for _, provider := range plan.Candidates {
			value, err := call(ctx, provider)
			if err == nil {
				recordSuccess(planner, provider)
				return ProviderValue[T]{Provider: provider, Value: value}, nil
			}
			lastErr = err
			recordFailure(planner, provider, err)
		}
		if lastErr == nil {
			lastErr = fmt.Errorf("no providers configured")
		}
		return zero, lastErr
	}

	runCtx, cancel := context.WithCancel(ctx)
	defer cancel()

	group, groupCtx := errgroup.WithContext(runCtx)
	sem := semaphore.NewWeighted(plan.ConcurrencyLimit)
	results := make(chan ProviderResult[T], len(plan.Candidates))

	for index, provider := range plan.Candidates {
		group.Go(func(index int, provider string) func() error {
			return func() error {
				if err := sem.Acquire(groupCtx, 1); err != nil {
					return fmt.Errorf("acquire provider slot: %w", err)
				}
				defer sem.Release(1)

				value, err := call(groupCtx, provider)
				select {
				case results <- ProviderResult[T]{Index: index, Provider: provider, Value: value, Err: err}:
				case <-groupCtx.Done():
				}
				return nil
			}
		}(index, provider))
	}

	errs := make([]error, len(plan.Candidates))
	for range plan.Candidates {
		result := <-results
		if result.Err == nil {
			cancel()
			recordSuccess(planner, result.Provider)
			_ = group.Wait()
			return ProviderValue[T]{Provider: result.Provider, Value: result.Value}, nil
		}
		errs[result.Index] = result.Err
		recordFailure(planner, result.Provider, result.Err)
	}
	_ = group.Wait()

	var lastErr error
	for _, err := range errs {
		if err != nil {
			lastErr = err
			break
		}
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("no providers configured")
	}
	return zero, lastErr
}

func ExecuteAll[T any](ctx context.Context, planner *Planner, plan Plan, call func(context.Context, string) (T, error)) []ProviderResult[T] {
	if len(plan.Candidates) == 0 {
		return nil
	}

	results := make([]ProviderResult[T], 0, len(plan.Candidates))
	if plan.ConcurrencyLimit <= 1 {
		for index, provider := range plan.Candidates {
			value, err := call(ctx, provider)
			if err == nil {
				recordSuccess(planner, provider)
			} else {
				recordFailure(planner, provider, err)
			}
			results = append(results, ProviderResult[T]{Index: index, Provider: provider, Value: value, Err: err})
		}
		return results
	}

	group, groupCtx := errgroup.WithContext(ctx)
	sem := semaphore.NewWeighted(plan.ConcurrencyLimit)
	resultsCh := make(chan ProviderResult[T], len(plan.Candidates))

	for index, provider := range plan.Candidates {
		group.Go(func(index int, provider string) func() error {
			return func() error {
				if err := sem.Acquire(groupCtx, 1); err != nil {
					return fmt.Errorf("acquire provider slot: %w", err)
				}
				defer sem.Release(1)

				value, err := call(groupCtx, provider)
				select {
				case resultsCh <- ProviderResult[T]{Index: index, Provider: provider, Value: value, Err: err}:
				case <-groupCtx.Done():
				}
				return nil
			}
		}(index, provider))
	}

	for range plan.Candidates {
		result := <-resultsCh
		if result.Err == nil {
			recordSuccess(planner, result.Provider)
		} else {
			recordFailure(planner, result.Provider, result.Err)
		}
		results = append(results, result)
	}
	_ = group.Wait()
	return results
}

func recordSuccess(planner *Planner, provider string) {
	if planner == nil {
		return
	}
	planner.RecordSuccess(provider)
}

func recordFailure(planner *Planner, provider string, err error) {
	if planner == nil || err == nil {
		return
	}
	if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
		return
	}
	planner.RecordFailure(provider, err)
}
