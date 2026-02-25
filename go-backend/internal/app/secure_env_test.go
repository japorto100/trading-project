package app

import (
	"encoding/base64"
	"os"
	"testing"

	"tradeviewfusion/go-backend/internal/security/aesgcm"
)

func TestSecureEnvDecoder_DecodeStringValue_PrefersEncryptedValue(t *testing.T) {
	key := make([]byte, 32)
	for i := range key {
		key[i] = byte(i + 1)
	}
	keyB64 := base64.StdEncoding.EncodeToString(key)

	sealed, err := aesgcm.Encrypt(key, []byte("super-secret-user"))
	if err != nil {
		t.Fatalf("encrypt: %v", err)
	}

	t.Setenv("GCT_SERVICE_CREDS_AES256_KEY_B64", keyB64)
	t.Setenv("GCT_USERNAME", "plain-user")
	t.Setenv("GCT_USERNAME_ENC", sealed)

	decoder, err := secureEnvDecoderFromEnv()
	if err != nil {
		t.Fatalf("decoder from env: %v", err)
	}

	got, err := decoder.decodeStringValue("GCT_USERNAME", "GCT_USERNAME_ENC", "fallback")
	if err != nil {
		t.Fatalf("decode string value: %v", err)
	}
	if got != "super-secret-user" {
		t.Fatalf("expected encrypted value, got %q", got)
	}
}

func TestSecureEnvDecoder_DecodeStringValue_FallsBackToPlainValue(t *testing.T) {
	t.Setenv("GCT_SERVICE_CREDS_AES256_KEY_B64", "")
	t.Setenv("GCT_PASSWORD", "plain-pass")
	_ = os.Unsetenv("GCT_PASSWORD_ENC")

	decoder, err := secureEnvDecoderFromEnv()
	if err != nil {
		t.Fatalf("decoder from env: %v", err)
	}
	got, err := decoder.decodeStringValue("GCT_PASSWORD", "GCT_PASSWORD_ENC", "fallback")
	if err != nil {
		t.Fatalf("decode string value: %v", err)
	}
	if got != "plain-pass" {
		t.Fatalf("expected plain fallback value, got %q", got)
	}
}
