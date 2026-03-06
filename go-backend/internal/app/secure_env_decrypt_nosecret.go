//go:build !goexperiment.runtimesecret

package app

import "tradeviewfusion/go-backend/internal/security/aesgcm"

// decryptEnvValue decrypts a sealed AES-256-GCM value using key.
// Build path: default (no GOEXPERIMENT=runtimesecret).
func decryptEnvValue(key []byte, sealed string) ([]byte, error) {
	return aesgcm.Decrypt(key, sealed)
}
