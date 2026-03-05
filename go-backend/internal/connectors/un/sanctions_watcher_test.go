package un

import (
	"bytes"
	"os"
	"testing"
)

func TestParseUNSanctionsXML(t *testing.T) {
	xml := `<?xml version="1.0"?>
<CONSOLIDATED_LIST>
  <INDIVIDUALS>
    <INDIVIDUAL>
      <DATAID>QDi.001</DATAID>
      <FIRST_NAME>John</FIRST_NAME>
      <SECOND_NAME>Doe</SECOND_NAME>
    </INDIVIDUAL>
    <INDIVIDUAL>
      <DATAID>QDi.002</DATAID>
      <FIRST_NAME>Jane</FIRST_NAME>
    </INDIVIDUAL>
  </INDIVIDUALS>
  <ENTITIES>
    <ENTITY>
      <DATAID>QDe.001</DATAID>
      <NAME>Acme Corp</NAME>
    </ENTITY>
    <ENTITY>
      <DATAID>QDe.002</DATAID>
      <FIRST_NAME>Other Entity</FIRST_NAME>
    </ENTITY>
  </ENTITIES>
</CONSOLIDATED_LIST>`
	got, err := parseUNSanctionsXML(bytes.NewReader([]byte(xml)))
	if err != nil {
		t.Fatalf("parseUNSanctionsXML: %v", err)
	}
	if len(got) != 4 {
		t.Fatalf("expected 4 records, got %d", len(got))
	}
	// Individual with full name
	if got[0]["reference_number"] != "QDi.001" || got[0]["name"] != "John Doe" || got[0]["type"] != "individual" {
		t.Fatalf("unexpected record 0: %v", got[0])
	}
	// Individual with single name
	if got[1]["reference_number"] != "QDi.002" || got[1]["name"] != "Jane" {
		t.Fatalf("unexpected record 1: %v", got[1])
	}
	// Entity with NAME
	if got[2]["reference_number"] != "QDe.001" || got[2]["name"] != "Acme Corp" || got[2]["type"] != "entity" {
		t.Fatalf("unexpected record 2: %v", got[2])
	}
	// Entity with FIRST_NAME fallback
	if got[3]["reference_number"] != "QDe.002" || got[3]["name"] != "Other Entity" {
		t.Fatalf("unexpected record 3: %v", got[3])
	}
}

func TestParseUNSanctionsXML_Empty(t *testing.T) {
	xml := `<?xml version="1.0"?>
<CONSOLIDATED_LIST>
  <INDIVIDUALS/>
  <ENTITIES/>
</CONSOLIDATED_LIST>`
	got, err := parseUNSanctionsXML(bytes.NewReader([]byte(xml)))
	if err != nil {
		t.Fatalf("parseUNSanctionsXML: %v", err)
	}
	if len(got) != 0 {
		t.Fatalf("expected 0 records, got %d", len(got))
	}
}

func TestParseUNSanctionsXML_Invalid(t *testing.T) {
	_, err := parseUNSanctionsXML(bytes.NewReader([]byte("not xml")))
	if err == nil {
		t.Fatal("expected error for invalid XML")
	}
}

func TestNewSanctionsWatcher(t *testing.T) {
	w := NewSanctionsWatcher("", nil)
	if w == nil {
		t.Fatal("expected non-nil watcher")
	}
}

func TestGetEnv(t *testing.T) {
	key := "UN_SANCTIONS_TEST_KEY_UNUSED"
	if got := getEnv(key, "fallback"); got != "fallback" {
		t.Fatalf("expected fallback when env empty, got %q", got)
	}
	if got := getEnv(key, ""); got != "" {
		t.Fatalf("expected empty when both empty, got %q", got)
	}
	os.Setenv(key, "custom")
	defer os.Unsetenv(key)
	if got := getEnv(key, "fallback"); got != "custom" {
		t.Fatalf("expected env value when set, got %q", got)
	}
}
