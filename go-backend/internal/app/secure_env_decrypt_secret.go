//go:build goexperiment.runtimesecret

package app

import (
	"runtime/secret"

	"tradeviewfusion/go-backend/internal/security/aesgcm"
)

// decryptEnvValue decrypts a sealed AES-256-GCM value using key.
// Build path: GOEXPERIMENT=runtimesecret — wraps decrypt in secret.Do so that
// key material and plaintext are zeroed from registers/stack after return.
// On Windows this is a passthrough (no mlock); fully effective on linux/amd64 + linux/arm64.
func decryptEnvValue(key []byte, sealed string) ([]byte, error) {
	var plaintext []byte
	var decErr error
	secret.Do(func() {
		plaintext, decErr = aesgcm.Decrypt(key, sealed)
	})
	return plaintext, decErr
}
