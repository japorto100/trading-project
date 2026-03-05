package ofac

import (
	"bytes"
	"testing"
)

func TestParseSDNXML(t *testing.T) {
	xml := `<?xml version="1.0"?>
<sdnList>
  <sdnEntry>
    <uid>123</uid>
    <lastName>Doe</lastName>
    <sdnType>individual</sdnType>
  </sdnEntry>
  <sdnEntry>
    <uid>456</uid>
    <lastName>Acme Corp</lastName>
    <sdnType>entity</sdnType>
  </sdnEntry>
</sdnList>`
	got, err := parseSDNXML(bytes.NewReader([]byte(xml)))
	if err != nil {
		t.Fatalf("parseSDNXML: %v", err)
	}
	if len(got) != 2 {
		t.Fatalf("expected 2 entries, got %d", len(got))
	}
	if got[0]["uid"] != "123" || got[0]["lastName"] != "Doe" || got[0]["sdnType"] != "individual" {
		t.Fatalf("unexpected entry 0: %v", got[0])
	}
	if got[1]["uid"] != "456" || got[1]["lastName"] != "Acme Corp" {
		t.Fatalf("unexpected entry 1: %v", got[1])
	}
}

func TestParseSDNXML_Empty(t *testing.T) {
	xml := `<?xml version="1.0"?><sdnList></sdnList>`
	got, err := parseSDNXML(bytes.NewReader([]byte(xml)))
	if err != nil {
		t.Fatalf("parseSDNXML: %v", err)
	}
	if len(got) != 0 {
		t.Fatalf("expected 0 entries, got %d", len(got))
	}
}

func TestNewSDNWatcher(t *testing.T) {
	w := NewSDNWatcher("", nil)
	if w == nil {
		t.Fatal("expected non-nil watcher")
	}
}
