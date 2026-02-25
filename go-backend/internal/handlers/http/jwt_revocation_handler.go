package http

import (
	"encoding/json"
	"net/http"
	"net/netip"
	"strconv"
	"strings"
	"time"
)

type jtiRevokerFunc func(jti string, expiresAt time.Time)
type jtiRevocationAuditorFunc func(record JWTRevocationAuditRecord)
type jtiRevocationAuditListerFunc func(limit int) []JWTRevocationAuditRecord

type revokeJTIRequest struct {
	JTI string `json:"jti"`
	Exp *int64 `json:"exp,omitempty"`
}

func JWTJTIRevocationHandler(revoke jtiRevokerFunc) http.HandlerFunc {
	return JWTJTIRevocationHandlerWithAudit(revoke, nil)
}

func JWTJTIRevocationHandlerWithAudit(revoke jtiRevokerFunc, audit jtiRevocationAuditorFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		if revoke == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "jwt revocation unavailable"})
			return
		}

		var payload revokeJTIRequest
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json body"})
			return
		}

		jti := strings.TrimSpace(payload.JTI)
		if jti == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "jti is required"})
			return
		}

		var exp time.Time
		if payload.Exp != nil && *payload.Exp > 0 {
			exp = time.Unix(*payload.Exp, 0).UTC()
		}
		revoke(jti, exp)
		if audit != nil {
			audit(JWTRevocationAuditRecord{
				JTI:        jti,
				ExpiresAt:  exp,
				RequestID:  strings.TrimSpace(r.Header.Get("X-Request-ID")),
				ActorUser:  strings.TrimSpace(r.Header.Get("X-Auth-User")),
				ActorRole:  strings.TrimSpace(r.Header.Get("X-User-Role")),
				SourceIP:   requestSourceIP(r),
				RecordedAt: time.Now().UTC(),
			})
		}

		response := map[string]any{
			"accepted": true,
			"jti":      jti,
		}
		if !exp.IsZero() {
			response["expiresAt"] = exp.Format(time.RFC3339)
		}
		writeJSON(w, http.StatusAccepted, response)
	}
}

func JWTJTIRevocationAuditHandler(list jtiRevocationAuditListerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		if list == nil {
			writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "jwt revocation audit unavailable"})
			return
		}

		limit := 50
		if raw := strings.TrimSpace(r.URL.Query().Get("limit")); raw != "" {
			if parsed, err := strconv.Atoi(raw); err == nil {
				switch {
				case parsed < 1:
					limit = 1
				case parsed > 200:
					limit = 200
				default:
					limit = parsed
				}
			}
		}

		records := list(limit)
		items := make([]map[string]any, 0, len(records))
		for _, record := range records {
			item := map[string]any{
				"jti":        record.JTI,
				"recordedAt": record.RecordedAt.UTC().Format(time.RFC3339Nano),
				"requestId":  record.RequestID,
				"actorUser":  record.ActorUser,
				"actorRole":  record.ActorRole,
				"sourceIp":   record.SourceIP,
			}
			if !record.ExpiresAt.IsZero() {
				item["expiresAt"] = record.ExpiresAt.UTC().Format(time.RFC3339)
			}
			items = append(items, item)
		}

		writeJSON(w, http.StatusOK, map[string]any{
			"items":  items,
			"count":  len(items),
			"limit":  limit,
			"newest": true,
		})
	}
}

func requestSourceIP(r *http.Request) string {
	if r == nil {
		return ""
	}
	if forwardedFor := strings.TrimSpace(r.Header.Get("X-Forwarded-For")); forwardedFor != "" {
		parts := strings.Split(forwardedFor, ",")
		if len(parts) > 0 {
			candidate := strings.TrimSpace(parts[0])
			if candidate != "" {
				return candidate
			}
		}
	}
	hostPort := strings.TrimSpace(r.RemoteAddr)
	if hostPort == "" {
		return ""
	}
	if addr, err := netip.ParseAddrPort(hostPort); err == nil {
		return addr.Addr().String()
	}
	return hostPort
}
