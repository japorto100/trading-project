package version

import "testing"

func TestValueIsSet(t *testing.T) {
	if Value == "" {
		t.Fatal("version value must not be empty")
	}
}
