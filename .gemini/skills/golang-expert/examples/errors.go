package examples

import (
	"errors"
	"fmt"
)

var (
	ErrNotFound   = errors.New("resource not found")
	ErrBadRequest = errors.New("bad request")
)

type UpstreamError struct {
	Scope string
	Err   error
}

func (e *UpstreamError) Error() string {
	return fmt.Sprintf("%s: %v", e.Scope, e.Err)
}

func (e *UpstreamError) Unwrap() error {
	return e.Err
}

func parseUserID(raw string) (string, error) {
	if raw == "" {
		return "", fmt.Errorf("parse user id: %w", ErrBadRequest)
	}
	return raw, nil
}

func loadUserFromConnector(id string) error {
	if id == "missing" {
		return ErrNotFound
	}
	return errors.New("connection reset by peer")
}

func GetUserProfile(rawID string) error {
	id, err := parseUserID(rawID)
	if err != nil {
		return err
	}

	if err := loadUserFromConnector(id); err != nil {
		if errors.Is(err, ErrNotFound) {
			return fmt.Errorf("get user profile %q: %w", id, err)
		}
		return &UpstreamError{
			Scope: fmt.Sprintf("load user profile %q", id),
			Err:   fmt.Errorf("connector call failed: %w", err),
		}
	}

	return nil
}
