package app

import (
	"testing"
	"time"
)

func TestJWTRevocationBlocklist_RevokeAndCheck(t *testing.T) {
	blocklist := newJWTRevocationBlocklist()
	now := time.Now()
	blocklist.Revoke("jti-1", now.Add(time.Minute))

	if !blocklist.IsRevoked("jti-1", now) {
		t.Fatalf("expected jti to be revoked")
	}
	if blocklist.IsRevoked("jti-2", now) {
		t.Fatalf("expected unknown jti to not be revoked")
	}
}

func TestJWTRevocationBlocklist_ExpiredEntryIsPruned(t *testing.T) {
	blocklist := newJWTRevocationBlocklist()
	now := time.Now()
	blocklist.Revoke("jti-expired", now.Add(10*time.Millisecond))

	if !blocklist.IsRevoked("jti-expired", now) {
		t.Fatalf("expected jti to be revoked before expiry")
	}
	if blocklist.IsRevoked("jti-expired", now.Add(time.Second)) {
		t.Fatalf("expected expired jti to be pruned")
	}
}
