package app

import (
	"strings"
	"sync"
	"time"
)

type jwtRevocationBlocklist struct {
	mu      sync.RWMutex
	entries map[string]time.Time
}

func newJWTRevocationBlocklist() *jwtRevocationBlocklist {
	return &jwtRevocationBlocklist{
		entries: make(map[string]time.Time),
	}
}

func (b *jwtRevocationBlocklist) Revoke(jti string, expiresAt time.Time) {
	if b == nil {
		return
	}
	key := strings.TrimSpace(jti)
	if key == "" {
		return
	}

	exp := expiresAt
	if exp.IsZero() {
		// Default guardrail if caller cannot provide token expiry.
		exp = time.Now().Add(15 * time.Minute)
	}

	b.mu.Lock()
	b.entries[key] = exp
	b.mu.Unlock()
}

func (b *jwtRevocationBlocklist) IsRevoked(jti string, now time.Time) bool {
	if b == nil {
		return false
	}
	key := strings.TrimSpace(jti)
	if key == "" {
		return false
	}

	if now.IsZero() {
		now = time.Now()
	}

	b.mu.Lock()
	defer b.mu.Unlock()

	exp, ok := b.entries[key]
	if !ok {
		return false
	}
	if !exp.After(now) {
		delete(b.entries, key)
		return false
	}
	return true
}
