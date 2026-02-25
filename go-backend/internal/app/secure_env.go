package app

import (
	"fmt"
	"os"
	"strings"

	"tradeviewfusion/go-backend/internal/security/aesgcm"
)

type secureEnvDecoder struct {
	key []byte
}

func secureEnvDecoderFromEnv() (*secureEnvDecoder, error) {
	keyBase64 := strings.TrimSpace(envOr("GCT_SERVICE_CREDS_AES256_KEY_B64", envOr("GCT_EXCHANGE_KEYS_AES256_KEY_B64", "")))
	if keyBase64 == "" {
		return &secureEnvDecoder{}, nil
	}
	key, err := aesgcm.ParseKeyBase64(keyBase64)
	if err != nil {
		return nil, fmt.Errorf("secure env key: %w", err)
	}
	return &secureEnvDecoder{key: key}, nil
}

func (d *secureEnvDecoder) decodeStringValue(plainEnvKey, encEnvKey string, fallback string) (string, error) {
	if d != nil && len(d.key) > 0 {
		if sealed := strings.TrimSpace(os.Getenv(encEnvKey)); sealed != "" {
			plaintext, err := aesgcm.Decrypt(d.key, sealed)
			if err != nil {
				return "", fmt.Errorf("decrypt %s: %w", encEnvKey, err)
			}
			return strings.TrimSpace(string(plaintext)), nil
		}
	}
	return envOr(plainEnvKey, fallback), nil
}
