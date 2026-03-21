package examples

import "testing"

func localSnapshotID(sourceID, checksum string) string {
	return NormalizeTopicSuffix(sourceID) + ":" + checksum
}

func FuzzLocalSnapshotID(f *testing.F) {
	f.Add("ofac", "abc123")
	f.Add("", "")
	f.Add("seco.json", "deadbeef")

	f.Fuzz(func(t *testing.T, sourceID, checksum string) {
		got := localSnapshotID(sourceID, checksum)
		got2 := localSnapshotID(sourceID, checksum)
		if got != got2 {
			t.Fatalf("non-deterministic result: %q != %q", got, got2)
		}
	})
}
