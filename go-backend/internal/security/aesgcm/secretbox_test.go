package aesgcm

import (
	"encoding/base64"
	"testing"
)

func TestEncryptDecryptRoundTrip(t *testing.T) {
	key := make([]byte, 32)
	for i := range key {
		key[i] = byte(i + 1)
	}

	sealed, err := Encrypt(key, []byte("super-secret"))
	if err != nil {
		t.Fatalf("encrypt failed: %v", err)
	}
	plain, err := Decrypt(key, sealed)
	if err != nil {
		t.Fatalf("decrypt failed: %v", err)
	}
	if string(plain) != "super-secret" {
		t.Fatalf("unexpected plaintext: %q", string(plain))
	}
}

func TestParseKeyBase64(t *testing.T) {
	raw := make([]byte, 32)
	for i := range raw {
		raw[i] = byte(i)
	}
	key, err := ParseKeyBase64(base64.StdEncoding.EncodeToString(raw))
	if err != nil {
		t.Fatalf("parse failed: %v", err)
	}
	if len(key) != 32 {
		t.Fatalf("expected 32-byte key, got %d", len(key))
	}
}

func TestParseKeyBase64RejectsWrongLength(t *testing.T) {
	if _, err := ParseKeyBase64(base64.StdEncoding.EncodeToString([]byte("short"))); err == nil {
		t.Fatal("expected error for short key")
	}
}
