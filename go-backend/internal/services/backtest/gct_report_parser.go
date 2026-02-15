package backtest

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

var (
	htmlCellTemplate = `(?is)<td>\s*<b>%s</b>\s*</td>\s*<td>(.*?)</td>`
	numberPattern    = regexp.MustCompile(`[-+]?\d[\d,]*(?:\.\d+)?`)
	drawdownPattern  = regexp.MustCompile(`(?is)drop:\s*</b>\s*([-+]?\d[\d,]*(?:\.\d+)?)\s*%`)
)

func extractGCTReportResult(reportDir, strategyName string, startedAt time.Time) (*RunResult, error) {
	reportPath, err := locateGCTReportFile(reportDir, strategyName, startedAt)
	if err != nil || reportPath == "" {
		return nil, err
	}

	body, err := os.ReadFile(reportPath)
	if err != nil {
		return nil, err
	}
	return parseGCTReportHTML(string(body)), nil
}

func locateGCTReportFile(reportDir, strategyName string, startedAt time.Time) (string, error) {
	directory := strings.TrimSpace(reportDir)
	if directory == "" {
		return "", nil
	}

	entries, err := os.ReadDir(directory)
	if err != nil {
		return "", err
	}

	strategyNeedle := strings.ToLower(strings.TrimSpace(strategyName))
	type candidate struct {
		name   string
		path   string
		mod    time.Time
		scored int
	}
	var all []candidate

	for _, entry := range entries {
		if entry.IsDir() || !strings.EqualFold(filepath.Ext(entry.Name()), ".html") {
			continue
		}
		info, infoErr := entry.Info()
		if infoErr != nil {
			continue
		}

		nameLower := strings.ToLower(entry.Name())
		score := 0
		if strategyNeedle != "" && strings.Contains(nameLower, strategyNeedle) {
			score += 10
		}
		if !startedAt.IsZero() && !info.ModTime().Before(startedAt.Add(-3*time.Minute)) {
			score += 4
		}

		all = append(all, candidate{
			name:   entry.Name(),
			path:   filepath.Join(directory, entry.Name()),
			mod:    info.ModTime(),
			scored: score,
		})
	}
	if len(all) == 0 {
		return "", nil
	}

	best := all[0]
	for _, item := range all[1:] {
		if item.scored > best.scored {
			best = item
			continue
		}
		if item.scored == best.scored && item.mod.After(best.mod) {
			best = item
		}
	}
	return best.path, nil
}

func parseGCTReportHTML(body string) *RunResult {
	if strings.TrimSpace(body) == "" {
		return nil
	}

	result := RunResult{}
	found := 0

	if netReturn, ok := extractHTMLCellFloat(body, "Strategy Movement"); ok {
		result.NetReturn = round2(netReturn)
		found++
	}
	if sharpe, ok := extractHTMLCellFloat(body, "Sharpe Ratio"); ok {
		result.Sharpe = round2(sharpe)
		found++
	}
	if drawdown, ok := extractHTMLDrawdown(body); ok {
		result.MaxDrawdown = round2(drawdown)
		found++
	}
	if trades, ok := extractHTMLCellInt(body, "Total Orders"); ok {
		result.Trades = trades
		found++
	}

	if found == 0 {
		return nil
	}
	return &result
}

func extractHTMLDrawdown(body string) (float64, bool) {
	for _, label := range []string{"Biggest Drawdown", "Max Drawdown"} {
		cell, ok := extractHTMLCellValue(body, label)
		if !ok {
			continue
		}
		matches := drawdownPattern.FindStringSubmatch(cell)
		if len(matches) > 1 {
			value, err := parseFlexibleFloat(matches[1])
			if err == nil {
				return value, true
			}
		}
		value, err := parseFirstFloat(cell)
		if err == nil {
			return value, true
		}
	}
	return 0, false
}

func extractHTMLCellInt(body, label string) (int, bool) {
	cell, ok := extractHTMLCellValue(body, label)
	if !ok {
		return 0, false
	}
	value, err := parseFirstInt(cell)
	if err != nil {
		return 0, false
	}
	return value, true
}

func extractHTMLCellFloat(body, label string) (float64, bool) {
	cell, ok := extractHTMLCellValue(body, label)
	if !ok {
		return 0, false
	}
	value, err := parseFirstFloat(cell)
	if err != nil {
		return 0, false
	}
	return value, true
}

func extractHTMLCellValue(body, label string) (string, bool) {
	pattern := regexp.MustCompile(fmt.Sprintf(htmlCellTemplate, regexp.QuoteMeta(label)))
	matches := pattern.FindStringSubmatch(body)
	if len(matches) < 2 {
		return "", false
	}
	return strings.TrimSpace(matches[1]), true
}

func parseFirstFloat(value string) (float64, error) {
	matched := numberPattern.FindString(value)
	if matched == "" {
		return 0, fmt.Errorf("no number in value")
	}
	return parseFlexibleFloat(matched)
}

func parseFlexibleFloat(value string) (float64, error) {
	normalized := strings.TrimSpace(strings.ReplaceAll(value, ",", ""))
	if normalized == "" {
		return 0, fmt.Errorf("empty numeric value")
	}
	return strconv.ParseFloat(normalized, 64)
}

func parseFirstInt(value string) (int, error) {
	matched := numberPattern.FindString(value)
	if matched == "" {
		return 0, fmt.Errorf("no integer in value")
	}
	normalized := strings.TrimSpace(strings.ReplaceAll(matched, ",", ""))
	parsed, err := strconv.Atoi(normalized)
	if err != nil {
		return 0, err
	}
	return parsed, nil
}
