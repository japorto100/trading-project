package examples

import (
	"context"
	"fmt"
	"sync"
)

// SOTA 2026: Worker pool with explicit cancellation semantics and optional
// object reuse via sync.Pool.

type Task[T any] struct {
	Data T
}

var taskPool = sync.Pool{
	New: func() any {
		return new(Task[string])
	},
}

func ProcessTasks[T any](ctx context.Context, items []T, workerCount int) error {
	wg := sync.WaitGroup{}
	ch := make(chan T, workerCount)

	for range workerCount {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				select {
				case item, ok := <-ch:
					if !ok {
						return
					}

					slot := taskPool.Get().(*Task[string])
					fmt.Printf("Processing: %v\n", item)
					slot.Data = ""
					taskPool.Put(slot)
				case <-ctx.Done():
					return
				}
			}
		}()
	}

	for _, item := range items {
		select {
		case ch <- item:
		case <-ctx.Done():
			close(ch)
			wg.Wait()
			return ctx.Err()
		}
	}

	close(ch)
	wg.Wait()
	return ctx.Err()
}
