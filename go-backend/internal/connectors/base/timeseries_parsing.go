package base

import (
	"fmt"
	"strconv"
	"strings"
	"time"
)

const (
	DateFormatISODate     = "yyyy-mm-dd"
	DateFormatSlashDMY    = "dd/mm/yyyy"
	DateFormatYYYYMM      = "yyyymm"
	DateFormatYYYY        = "yyyy"
	DateFormatQuarterCode = "yyyyQn"
)

func ParseSeriesTime(format, value string) (time.Time, error) {
	raw := strings.TrimSpace(value)
	if raw == "" {
		return time.Time{}, fmt.Errorf("empty date value")
	}
	switch strings.TrimSpace(format) {
	case DateFormatISODate:
		return time.Parse("2006-01-02", raw)
	case DateFormatSlashDMY:
		return time.Parse("02/01/2006", raw)
	case DateFormatYYYYMM:
		return time.Parse("200601", raw)
	case DateFormatYYYY:
		return time.Parse("2006", raw)
	case DateFormatQuarterCode:
		if len(raw) != 6 || raw[4] != 'Q' {
			return time.Time{}, fmt.Errorf("invalid quarter code %q", raw)
		}
		year, yErr := strconv.Atoi(raw[:4])
		quarter, qErr := strconv.Atoi(raw[5:])
		if yErr != nil || qErr != nil || quarter < 1 || quarter > 4 {
			return time.Time{}, fmt.Errorf("invalid quarter code %q", raw)
		}
		month := time.Month((quarter-1)*3 + 1)
		return time.Date(year, month, 1, 0, 0, 0, 0, time.UTC), nil
	default:
		return time.Time{}, fmt.Errorf("unsupported date format %q", format)
	}
}
