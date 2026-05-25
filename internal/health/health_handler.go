package health

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"runtime"
	"time"

	"github.com/sankarshankar/go-chat/internal/ws"
)

type Handler struct {
	db  *sql.DB
	hub *ws.Hub
}

func NewHandler(db *sql.DB, hub *ws.Hub) *Handler {
	return &Handler{db: db, hub: hub}
}

type HealthResponse struct {
	Status    string `json:"status"`
	Timestamp string `json:"timestamp"`
	Uptime    string `json:"uptime"`
	DB        DBStatus `json:"db"`
	WebSocket WSStatus `json:"websocket"`
	Runtime   RuntimeStats `json:"runtime"`
}

type DBStatus struct {
	Connected bool   `json:"connected"`
	Error     string `json:"error,omitempty"`
}

type WSStatus struct {
	Rooms  int `json:"rooms"`
	Clients int `json:"clients"`
}

type RuntimeStats struct {
	GoRoutines int    `json:"goroutines"`
	GoVersion  string `json:"goVersion"`
	Arch       string `json:"arch"`
	OS         string `json:"os"`
	Memory     MemStats `json:"memory"`
}

type MemStats struct {
	AllocMB    float64 `json:"allocMB"`
	TotalAllocMB float64 `json:"totalAllocMB"`
	SysMB      float64 `json:"sysMB"`
	NumGC      uint32  `json:"numGC"`
}

var startTime = time.Now()

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	dbStatus := DBStatus{Connected: true}
	if err := h.db.Ping(); err != nil {
		dbStatus = DBStatus{Connected: false, Error: err.Error()}
	}

	rooms, totalClients := h.hub.Stats()

	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	resp := HealthResponse{
		Status:    "ok",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Uptime:    time.Since(startTime).Round(time.Second).String(),
		DB:        dbStatus,
		WebSocket: WSStatus{Rooms: rooms, Clients: totalClients},
		Runtime: RuntimeStats{
			GoRoutines: runtime.NumGoroutine(),
			GoVersion:  runtime.Version(),
			Arch:       runtime.GOARCH,
			OS:         runtime.GOOS,
			Memory: MemStats{
				AllocMB:      float64(m.Alloc) / 1024 / 1024,
				TotalAllocMB: float64(m.TotalAlloc) / 1024 / 1024,
				SysMB:        float64(m.Sys) / 1024 / 1024,
				NumGC:        m.NumGC,
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
