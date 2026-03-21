//go:build !goexperiment.runtimesecret

package app

import (
	"fmt"

	"tradeviewfusion/go-backend/internal/security/aesgcm"
)

// decryptEnvValue decrypts a sealed AES-256-GCM value using key.
// Build path: default (no GOEXPERIMENT=runtimesecret).
func decryptEnvValue(key []byte, sealed string) ([]byte, error) {
	plaintext, err := aesgcm.Decrypt(key, sealed)
	if err != nil {
		return nil, fmt.Errorf("decrypt env value: %w", err)
	}
	return plaintext, nil
}
