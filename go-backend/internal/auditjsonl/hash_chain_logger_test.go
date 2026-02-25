package auditjsonl

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestHashChainLogger_AppendsChainFieldsAndLinks(t *testing.T) {
	path := filepath.Join(t.TempDir(), "audit.jsonl")
	logger := NewHashChainLogger(path)
	if logger == nil {
		t.Fatalf("expected logger")
	}

	if err := logger.Append(map[string]any{"event": "first"}); err != nil {
		t.Fatalf("append first: %v", err)
	}
	if err := logger.Append(map[string]any{"event": "second"}); err != nil {
		t.Fatalf("append second: %v", err)
	}

	raw, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read file: %v", err)
	}
	lines := splitNonEmptyLines(string(raw))
	if len(lines) != 2 {
		t.Fatalf("expected 2 lines, got %d", len(lines))
	}

	var first map[string]any
	var second map[string]any
	if err := json.Unmarshal([]byte(lines[0]), &first); err != nil {
		t.Fatalf("decode first: %v", err)
	}
	if err := json.Unmarshal([]byte(lines[1]), &second); err != nil {
		t.Fatalf("decode second: %v", err)
	}

	if first["chainAlgo"] != ChainAlgorithmSHA256JSONLv1 {
		t.Fatalf("unexpected chainAlgo: %#v", first["chainAlgo"])
	}
	firstHash, _ := first["entryHash"].(string)
	secondPrev, _ := second["prevHash"].(string)
	if firstHash == "" {
		t.Fatalf("missing first entryHash")
	}
	if secondPrev != firstHash {
		t.Fatalf("expected second.prevHash=%q, got %q", firstHash, secondPrev)
	}
}

func TestHashChainLogger_ReloadsLastHashFromExistingFile(t *testing.T) {
	path := filepath.Join(t.TempDir(), "audit.jsonl")
	logger := NewHashChainLogger(path)
	if err := logger.Append(map[string]any{"event": "first"}); err != nil {
		t.Fatalf("append first: %v", err)
	}

	reloaded := NewHashChainLogger(path)
	if err := reloaded.Append(map[string]any{"event": "second"}); err != nil {
		t.Fatalf("append second: %v", err)
	}

	raw, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read file: %v", err)
	}
	lines := splitNonEmptyLines(string(raw))
	if len(lines) != 2 {
		t.Fatalf("expected 2 lines, got %d", len(lines))
	}
	var first map[string]any
	var second map[string]any
	_ = json.Unmarshal([]byte(lines[0]), &first)
	_ = json.Unmarshal([]byte(lines[1]), &second)
	firstHash, _ := first["entryHash"].(string)
	secondPrev, _ := second["prevHash"].(string)
	if firstHash == "" || secondPrev == "" {
		t.Fatalf("missing chain hashes")
	}
	if secondPrev != firstHash {
		t.Fatalf("expected chain link to persist across reload, got prev=%q first=%q", secondPrev, firstHash)
	}
}

func splitNonEmptyLines(s string) []string {
	out := make([]string, 0)
	start := 0
	for i := 0; i < len(s); i++ {
		if s[i] != '\n' {
			continue
		}
		line := s[start:i]
		if len(line) > 0 && line[len(line)-1] == '\r' {
			line = line[:len(line)-1]
		}
		if line != "" {
			out = append(out, line)
		}
		start = i + 1
	}
	if start < len(s) {
		line := s[start:]
		if line != "" {
			out = append(out, line)
		}
	}
	return out
}
