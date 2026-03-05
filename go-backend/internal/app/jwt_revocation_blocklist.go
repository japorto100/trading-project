package app

import (
	"strings"
	"sync"
	"time"
)

type jwtRevocationBlocklist struct {
	mu             sync.RWMutex
	jtiEntries     map[string]time.Time
	userRevocations map[string]time.Time // userId -> revokedBefore timestamp
}

func newJWTRevocationBlocklist() *jwtRevocationBlocklist {
	return &jwtRevocationBlocklist{
		jtiEntries:      make(map[string]time.Time),
		userRevocations: make(map[string]time.Time),
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
		exp = time.Now().Add(15 * time.Minute)
	}

	b.mu.Lock()
	b.jtiEntries[key] = exp
	b.mu.Unlock()
}

func (b *jwtRevocationBlocklist) RevokeUser(userId string, revokedBefore time.Time) {
	if b == nil || userId == "" {
		return
	}
	b.mu.Lock()
	b.userRevocations[userId] = revokedBefore
	b.mu.Unlock()
}

func (b *jwtRevocationBlocklist) IsRevoked(jti string, userId string, issuedAt time.Time, now time.Time) bool {
	if b == nil {
		return false
	}
	if now.IsZero() {
		now = time.Now()
	}

	b.mu.RLock()
	defer b.mu.RUnlock()

	// 1. Check specific JTI
	if jti != "" {
		if exp, ok := b.jtiEntries[jti]; ok {
			if !exp.After(now) {
				// Cleanup expired entry would need a Write Lock, 
				// we skip it in the hot path RLock for performance.
				return false 
			}
			return true
		}
	}

	// 2. Check global user revocation (e.g. password change)
	if userId != "" && !issuedAt.IsZero() {
		if revokedBefore, ok := b.userRevocations[userId]; ok {
			if !issuedAt.After(revokedBefore) {
				return true // Token was issued before the revocation event
			}
		}
	}

	return false
}
