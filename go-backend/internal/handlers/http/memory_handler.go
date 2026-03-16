package http

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"tradeviewfusion/go-backend/internal/cache"
	"tradeviewfusion/go-backend/internal/connectors/memory"
)

// memoryServiceClient is the interface the handler depends on.
type memoryServiceClient interface {
	PostKGSeed(ctx context.Context, req memory.KGSeedRequest) (memory.KGSeedResponse, error)
	PostKGQuery(ctx context.Context, req memory.KGQueryRequest) (memory.KGQueryResponse, error)
	GetKGNodes(ctx context.Context, nodeType string, limit int) (memory.KGNodesResponse, error)
	GetKGSync(ctx context.Context) (memory.KGSyncResponse, error)
	PostEpisode(ctx context.Context, req memory.EpisodeCreateRequest) (memory.EpisodeResponse, error)
	GetEpisodes(ctx context.Context, agentRole string, limit int) (memory.EpisodesListResponse, error)
	PostSearch(ctx context.Context, req memory.VectorSearchRequest) (memory.VectorSearchResponse, error)
	GetHealth(ctx context.Context) (memory.HealthResponse, error)
}

// ---------------------------------------------------------------------------
// KG Seed
// ---------------------------------------------------------------------------

func MemoryKGSeedHandler(client memoryServiceClient, c cache.Adapter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		var req memory.KGSeedRequest
		if err := decodeJSONBody(r, &req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": fmt.Sprintf("invalid request: %v", err)})
			return
		}
		resp, err := client.PostKGSeed(r.Context(), req)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "memory kg seed failed"})
			return
		}
		if c != nil {
			c.Delete(r.Context(), "tradeview:memory:kg:sync")
		}
		writeJSON(w, http.StatusOK, resp)
	}
}

// ---------------------------------------------------------------------------
// KG Query
// ---------------------------------------------------------------------------

func MemoryKGQueryHandler(client memoryServiceClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		var req memory.KGQueryRequest
		if err := decodeJSONBody(r, &req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": fmt.Sprintf("invalid request: %v", err)})
			return
		}
		if strings.TrimSpace(req.Query) == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "query is required"})
			return
		}
		resp, err := client.PostKGQuery(r.Context(), req)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "memory kg query failed"})
			return
		}
		writeJSON(w, http.StatusOK, resp)
	}
}

// ---------------------------------------------------------------------------
// KG Nodes
// ---------------------------------------------------------------------------

func MemoryKGNodesHandler(client memoryServiceClient, c cache.Adapter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		nodeType := strings.TrimSpace(r.URL.Query().Get("nodeType"))
		if nodeType == "" {
			nodeType = "Stratagem"
		}
		limit := 100
		if rawLimit := strings.TrimSpace(r.URL.Query().Get("limit")); rawLimit != "" {
			if parsed, err := strconv.Atoi(rawLimit); err == nil && parsed > 0 {
				limit = clampInt(parsed, 1, 500, 100)
			}
		}
		cacheKey := fmt.Sprintf("tradeview:memory:kg:nodes:%s:%d", nodeType, limit)
		if c != nil {
			if cached, ok := c.Get(r.Context(), cacheKey); ok {
				var resp memory.KGNodesResponse
				if json.Unmarshal([]byte(cached), &resp) == nil {
					writeJSON(w, http.StatusOK, resp)
					return
				}
			}
		}
		resp, err := client.GetKGNodes(r.Context(), nodeType, limit)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "memory kg nodes failed"})
			return
		}
		if c != nil {
			if raw, merr := json.Marshal(resp); merr == nil {
				c.Set(r.Context(), cacheKey, string(raw), 15*time.Minute)
			}
		}
		writeJSON(w, http.StatusOK, resp)
	}
}

// ---------------------------------------------------------------------------
// KG Sync
// ---------------------------------------------------------------------------

func MemoryKGSyncHandler(client memoryServiceClient, c cache.Adapter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		const cacheKey = "tradeview:memory:kg:sync"
		if c != nil {
			if cached, ok := c.Get(r.Context(), cacheKey); ok {
				var resp memory.KGSyncResponse
				if json.Unmarshal([]byte(cached), &resp) == nil {
					writeJSON(w, http.StatusOK, resp)
					return
				}
			}
		}
		resp, err := client.GetKGSync(r.Context())
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "memory kg sync failed"})
			return
		}
		if c != nil {
			if raw, merr := json.Marshal(resp); merr == nil {
				c.Set(r.Context(), cacheKey, string(raw), 60*time.Minute)
			}
		}
		writeJSON(w, http.StatusOK, resp)
	}
}

// ---------------------------------------------------------------------------
// Episode POST
// ---------------------------------------------------------------------------

func MemoryEpisodePostHandler(client memoryServiceClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		var req memory.EpisodeCreateRequest
		if err := decodeJSONBody(r, &req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": fmt.Sprintf("invalid request: %v", err)})
			return
		}
		if strings.TrimSpace(req.SessionID) == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "session_id is required"})
			return
		}
		resp, err := client.PostEpisode(r.Context(), req)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "memory episode create failed"})
			return
		}
		writeJSON(w, http.StatusCreated, resp)
	}
}

// ---------------------------------------------------------------------------
// Episodes GET
// ---------------------------------------------------------------------------

func MemoryEpisodesGetHandler(client memoryServiceClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		agentRole := strings.TrimSpace(r.URL.Query().Get("agentRole"))
		limit := 100
		if rawLimit := strings.TrimSpace(r.URL.Query().Get("limit")); rawLimit != "" {
			if parsed, err := strconv.Atoi(rawLimit); err == nil && parsed > 0 {
				limit = clampInt(parsed, 1, 1000, 100)
			}
		}
		resp, err := client.GetEpisodes(r.Context(), agentRole, limit)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "memory episodes list failed"})
			return
		}
		writeJSON(w, http.StatusOK, resp)
	}
}

// ---------------------------------------------------------------------------
// Vector search
// ---------------------------------------------------------------------------

func MemorySearchHandler(client memoryServiceClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.Header().Set("Allow", http.MethodPost)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		var req memory.VectorSearchRequest
		if err := decodeJSONBody(r, &req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": fmt.Sprintf("invalid request: %v", err)})
			return
		}
		if strings.TrimSpace(req.Query) == "" {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "query is required"})
			return
		}
		if req.NResults <= 0 {
			req.NResults = 5
		}
		resp, err := client.PostSearch(r.Context(), req)
		if err != nil {
			writeJSON(w, http.StatusBadGateway, map[string]string{"error": "memory vector search failed"})
			return
		}
		writeJSON(w, http.StatusOK, resp)
	}
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

func MemoryHealthHandler(client memoryServiceClient, cacheAdapter cache.Adapter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", http.MethodGet)
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
			return
		}
		resp, err := client.GetHealth(r.Context())
		cacheBackend := "unavailable"
		if cacheAdapter != nil {
			cacheBackend = cacheAdapter.BackendName()
		}
		if err != nil {
			writeJSON(w, http.StatusOK, map[string]any{
				"ok":       false,
				"kg":       "unavailable",
				"vector":   "unavailable",
				"cache":    cacheBackend,
				"episodic": "unavailable",
				"error":    "memory service unavailable",
			})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{
			"ok":       resp.OK,
			"kg":       resp.KG,
			"vector":   resp.Vector,
			"cache":    cacheBackend,
			"episodic": resp.Episodic,
		})
	}
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

func decodeJSONBody(r *http.Request, out any) error {
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20)) // 1 MB
	if err != nil {
		return fmt.Errorf("read body: %w", err)
	}
	if len(body) == 0 {
		return nil
	}
	return json.Unmarshal(body, out)
}
