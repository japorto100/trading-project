package backtest

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestParseGCTReportHTML(t *testing.T) {
	html := `
	<table>
		<tr><td><b>Total Orders</b></td><td>48</td></tr>
		<tr><td><b>Biggest Drawdown</b></td><td><b>Start:</b> t0 <b>End:</b> t1 <b>Drop:</b> 12.34%</td></tr>
		<tr><td><b>Strategy Movement</b></td><td>8.76%</td></tr>
		<tr><td><b>Sharpe Ratio</b></td><td>1.42</td></tr>
	</table>`

	result := parseGCTReportHTML(html)
	if result == nil {
		t.Fatal("expected result")
	}
	if result.Trades != 48 {
		t.Fatalf("expected 48 trades, got %d", result.Trades)
	}
	if result.MaxDrawdown != 12.34 {
		t.Fatalf("expected drawdown 12.34, got %.2f", result.MaxDrawdown)
	}
	if result.NetReturn != 8.76 {
		t.Fatalf("expected net return 8.76, got %.2f", result.NetReturn)
	}
	if result.Sharpe != 1.42 {
		t.Fatalf("expected sharpe 1.42, got %.2f", result.Sharpe)
	}
}

func TestLocateGCTReportFilePrefersStrategyAndRecency(t *testing.T) {
	dir := t.TempDir()
	now := time.Now()

	fileA := filepath.Join(dir, "foo-other-2026-02-15.html")
	fileB := filepath.Join(dir, "foo-dollarcostaverage-2026-02-16.html")
	if err := os.WriteFile(fileA, []byte("x"), 0o644); err != nil {
		t.Fatalf("write file A: %v", err)
	}
	if err := os.WriteFile(fileB, []byte("y"), 0o644); err != nil {
		t.Fatalf("write file B: %v", err)
	}
	_ = os.Chtimes(fileA, now.Add(-2*time.Hour), now.Add(-2*time.Hour))
	_ = os.Chtimes(fileB, now.Add(-2*time.Minute), now.Add(-2*time.Minute))

	path, err := locateGCTReportFile(dir, "dollarcostaverage", now.Add(-5*time.Minute))
	if err != nil {
		t.Fatalf("locate report: %v", err)
	}
	if path == "" {
		t.Fatal("expected report path")
	}
	if filepath.Base(path) != filepath.Base(fileB) {
		t.Fatalf("expected %s, got %s", filepath.Base(fileB), filepath.Base(path))
	}
}
