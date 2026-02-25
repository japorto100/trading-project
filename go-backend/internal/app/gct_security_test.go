package app

import (
	"testing"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

func TestValidateGCTSecurityConfig_RejectsWeakCredsWhenEnforced(t *testing.T) {
	err := validateGCTSecurityConfig(gct.Config{
		Username: "replace-me",
		Password: "replace-me",
	}, gctSecurityValidationConfig{EnforceStrongCredentials: true})
	if err == nil {
		t.Fatal("expected weak credential validation error")
	}
}

func TestValidateGCTSecurityConfig_RejectsInsecureTLSWhenPolicyDisallows(t *testing.T) {
	err := validateGCTSecurityConfig(gct.Config{
		Username:             "strong-user-12345",
		Password:             "strong-password-1234567890",
		InsecureSkipVerifyTL: true,
	}, gctSecurityValidationConfig{
		EnforceStrongCredentials: true,
		AllowInsecureTLS:         false,
	})
	if err == nil {
		t.Fatal("expected insecure TLS validation error")
	}
}

func TestValidateGCTSecurityConfig_AllowsStrongCredsAndTLS(t *testing.T) {
	err := validateGCTSecurityConfig(gct.Config{
		Username:             "svc-tradeview-gateway-001",
		Password:             "super-strong-password-123456789",
		InsecureSkipVerifyTL: false,
	}, gctSecurityValidationConfig{
		EnforceStrongCredentials: true,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}
