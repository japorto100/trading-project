package auditjsonl

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

const (
	ChainAlgorithmSHA256JSONLv1 = "sha256-jsonl-v1"
	defaultScanBufferSize       = 1024 * 1024
)

type HashChainLogger struct {
	mu       sync.Mutex
	path     string
	lastHash string
}

func NewHashChainLogger(path string) *HashChainLogger {
	trimmed := strings.TrimSpace(path)
	if trimmed == "" {
		return nil
	}
	return &HashChainLogger{
		path:     trimmed,
		lastHash: loadLastEntryHash(trimmed),
	}
}

func (l *HashChainLogger) Append(record map[string]any) error {
	if l == nil {
		return nil
	}
	if record == nil {
		record = map[string]any{}
	}

	dir := filepath.Dir(l.path)
	if dir != "." && dir != "" {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return fmt.Errorf("mkdir audit dir: %w", err)
		}
	}

	l.mu.Lock()
	defer l.mu.Unlock()

	payload := cloneMap(record)
	payload["chainAlgo"] = ChainAlgorithmSHA256JSONLv1
	payload["prevHash"] = l.lastHash

	hashMaterial, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal hash payload: %w", err)
	}
	sum := sha256.Sum256(hashMaterial)
	entryHash := hex.EncodeToString(sum[:])
	payload["entryHash"] = entryHash

	f, err := os.OpenFile(l.path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o600)
	if err != nil {
		return fmt.Errorf("open audit file: %w", err)
	}
	defer func() { _ = f.Close() }()

	enc := json.NewEncoder(f)
	if err := enc.Encode(payload); err != nil {
		return fmt.Errorf("write audit jsonl: %w", err)
	}

	l.lastHash = entryHash
	return nil
}

func cloneMap(in map[string]any) map[string]any {
	out := make(map[string]any, len(in))
	for k, v := range in {
		out[k] = v
	}
	return out
}

func loadLastEntryHash(path string) string {
	f, err := os.Open(path)
	if err != nil {
		return ""
	}
	defer func() { _ = f.Close() }()

	scanner := bufio.NewScanner(f)
	scanner.Buffer(make([]byte, 0, 64*1024), defaultScanBufferSize)
	lastHash := ""
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		var decoded map[string]any
		if err := json.Unmarshal([]byte(line), &decoded); err != nil {
			continue
		}
		if value, ok := decoded["entryHash"].(string); ok && strings.TrimSpace(value) != "" {
			lastHash = strings.TrimSpace(value)
		}
	}
	return lastHash
}
