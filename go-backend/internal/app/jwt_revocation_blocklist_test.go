package app

import (
	"testing"
	"time"
)

func TestJWTRevocationBlocklist_RevokeAndCheck(t *testing.T) {
	blocklist := newJWTRevocationBlocklist()
	now := time.Now()
	blocklist.Revoke("jti-1", now.Add(time.Minute))

	if !blocklist.IsRevoked("jti-1", "", time.Time{}, now) {
		t.Fatalf("expected jti to be revoked")
	}
	if blocklist.IsRevoked("jti-2", "", time.Time{}, now) {
		t.Fatalf("expected unknown jti to not be revoked")
	}
}

func TestJWTRevocationBlocklist_UserRevocation(t *testing.T) {
	blocklist := newJWTRevocationBlocklist()
	now := time.Now()
	userId := "user-123"
	
	// Revoke everything for this user issued before 'now'
	blocklist.RevokeUser(userId, now)

	// Case 1: Token issued BEFORE revocation event
	oldTokenIat := now.Add(-time.Minute)
	if !blocklist.IsRevoked("", userId, oldTokenIat, now) {
		t.Fatalf("expected old token to be revoked")
	}

	// Case 2: Token issued AFTER revocation event
	newTokenIat := now.Add(time.Minute)
	if blocklist.IsRevoked("", userId, newTokenIat, now) {
		t.Fatalf("expected new token to be valid")
	}
}

func TestJWTRevocationBlocklist_ExpiredEntryIsPruned(t *testing.T) {
	blocklist := newJWTRevocationBlocklist()
	now := time.Now()
	blocklist.Revoke("jti-expired", now.Add(10*time.Millisecond))

	if !blocklist.IsRevoked("jti-expired", "", time.Time{}, now) {
		t.Fatalf("expected jti to be revoked before expiry")
	}
	
	// Wait for expiry simulation
	later := now.Add(time.Second)
	if blocklist.IsRevoked("jti-expired", "", time.Time{}, later) {
		t.Fatalf("expected expired jti to be pruned/invalid")
	}
}
