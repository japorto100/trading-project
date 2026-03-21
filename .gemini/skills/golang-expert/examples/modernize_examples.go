package examples

import (
	"maps"
	"slices"
	"strings"
)

func NormalizeTopicSuffix(topic string) string {
	if trimmed, ok := strings.CutSuffix(topic, ".json"); ok {
		return trimmed
	}
	return topic
}

func ContainsTopic(topics []string, target string) bool {
	return slices.Contains(topics, target)
}

func MergeLabels(base map[string]string, extra map[string]string) map[string]string {
	merged := maps.Clone(base)
	maps.Copy(merged, extra)
	return merged
}

func ClampWorkerCount(n int) int {
	return max(1, min(n, 32))
}
