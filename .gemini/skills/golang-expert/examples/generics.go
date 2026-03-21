package examples

import "errors"

// SOTA 2026: Generic Result and Optional types.

type Result[T any] struct {
	Value T
	Err   error
}

func Success[T any](val T) Result[T] {
	return Result[T]{Value: val}
}

func Failure[T any](err error) Result[T] {
	return Result[T]{Err: err}
}

func (r Result[T]) Unwrap() (T, error) {
	return r.Value, r.Err
}

type Optional[T any] struct {
	value *T
}

func Some[T any](val T) Optional[T] {
	return Optional[T]{value: &val}
}

func None[T any]() Optional[T] {
	return Optional[T]{value: nil}
}

func (o Optional[T]) IsPresent() bool {
	return o.value != nil
}

func (o Optional[T]) Get() (T, bool) {
	if o.value == nil {
		var zero T
		return zero, false
	}
	return *o.value, true
}

func FetchUser(id string) Result[string] {
	if id == "" {
		return Failure[string](errors.New("invalid id"))
	}
	return Success("User-" + id)
}
