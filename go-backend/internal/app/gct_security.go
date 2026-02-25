package app

import (
	"fmt"
	"os"
	"strings"

	"tradeviewfusion/go-backend/internal/connectors/gct"
)

type gctSecurityValidationConfig struct {
	EnforceStrongCredentials bool
	AllowWeakCredentials     bool
	AllowInsecureTLS         bool
}

func validateGCTSecurityConfig(cfg gct.Config, policy gctSecurityValidationConfig) error {
	if policy.EnforceStrongCredentials && !policy.AllowWeakCredentials {
		if isWeakGCTCredential(cfg.Username, 12) || isWeakGCTCredential(cfg.Password, 20) {
			return fmt.Errorf("gct security: weak GCT credentials detected (set strong values or opt-in via GCT_ALLOW_WEAK_CREDENTIALS=true)")
		}
	}
	if cfg.InsecureSkipVerifyTL && !policy.AllowInsecureTLS {
		return fmt.Errorf("gct security: insecure TLS is disabled by policy (set GCT_JSONRPC_INSECURE_TLS=false or opt-in via GCT_ALLOW_INSECURE_TLS=true)")
	}
	return nil
}

func isWeakGCTCredential(value string, minLen int) bool {
	trimmed := strings.TrimSpace(value)
	if len(trimmed) < minLen {
		return true
	}
	switch strings.ToLower(trimmed) {
	case "replace-me", "admin", "password", "changeme":
		return true
	default:
		return false
	}
}

func gctSecurityPolicyFromEnv() gctSecurityValidationConfig {
	return gctSecurityValidationConfig{
		EnforceStrongCredentials: boolOr("GCT_ENFORCE_HARDENING", false),
		AllowWeakCredentials:     boolOr("GCT_ALLOW_WEAK_CREDENTIALS", false),
		AllowInsecureTLS:         boolOr("GCT_ALLOW_INSECURE_TLS", false) || boolOr("GCT_JSONRPC_INSECURE_TLS", false) && !boolOr("GCT_ENFORCE_HARDENING", false),
	}
}

func gctAuditJSONLPathFromEnv() string {
	path := strings.TrimSpace(os.Getenv("GCT_AUDIT_JSONL_PATH"))
	if path != "" {
		return path
	}
	return "data/audit/gct-actions.jsonl"
}

func gctAuditSQLitePathFromEnv() string {
	path := strings.TrimSpace(os.Getenv("GCT_AUDIT_DB_PATH"))
	if path != "" {
		return path
	}
	return "data/audit/gct-actions.db"
}

func jwtRevocationAuditJSONLPathFromEnv() string {
	path := strings.TrimSpace(os.Getenv("AUTH_JWT_REVOCATION_AUDIT_JSONL_PATH"))
	if path != "" {
		return path
	}
	return "data/audit/jwt-revocations.jsonl"
}

func jwtRevocationAuditSQLitePathFromEnv() string {
	path := strings.TrimSpace(os.Getenv("AUTH_JWT_REVOCATION_AUDIT_DB_PATH"))
	if path != "" {
		return path
	}
	return "data/audit/jwt-revocations.db"
}
