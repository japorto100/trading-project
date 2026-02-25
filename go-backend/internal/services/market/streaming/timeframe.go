package streaming

import (
	"fmt"
	"strings"
	"time"
)

type Timeframe struct {
	Label    string
	Duration time.Duration
}

func (t Timeframe) Seconds() int64 {
	return int64(t.Duration / time.Second)
}

var supportedTimeframes = map[string]Timeframe{
	"1m":  {Label: "1m", Duration: time.Minute},
	"3m":  {Label: "3m", Duration: 3 * time.Minute},
	"5m":  {Label: "5m", Duration: 5 * time.Minute},
	"15m": {Label: "15m", Duration: 15 * time.Minute},
	"30m": {Label: "30m", Duration: 30 * time.Minute},
	"1h":  {Label: "1H", Duration: time.Hour},
	"2h":  {Label: "2H", Duration: 2 * time.Hour},
	"4h":  {Label: "4H", Duration: 4 * time.Hour},
	"1d":  {Label: "1D", Duration: 24 * time.Hour},
	"1w":  {Label: "1W", Duration: 7 * 24 * time.Hour},
	// Month is approximate here (30d) and only used for bucket boundaries in a transitional stream path.
	"1mth": {Label: "1M", Duration: 30 * 24 * time.Hour},
}

func ParseTimeframe(value string) (Timeframe, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return supportedTimeframes["1m"], nil
	}
	// Preserve minute/month distinction (`1m` vs `1M`) from the frontend.
	switch trimmed {
	case "1M":
		return supportedTimeframes["1mth"], nil
	case "1H", "2H", "4H", "1D", "1W":
		return supportedTimeframes[strings.ToLower(trimmed)], nil
	case "1m", "3m", "5m", "15m", "30m":
		return supportedTimeframes[trimmed], nil
	}
	raw := strings.ToLower(trimmed)
	switch raw {
	case "1month", "1mon", "1mo":
		return supportedTimeframes["1mth"], nil
	default:
		if tf, ok := supportedTimeframes[raw]; ok {
			return tf, nil
		}
		return Timeframe{}, fmt.Errorf("unsupported timeframe %q", value)
	}
}

func BucketStartUnix(ts int64, tf Timeframe) int64 {
	seconds := tf.Seconds()
	if seconds <= 0 {
		return ts
	}
	return (ts / seconds) * seconds
}
