package ws

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/websocket"
)

type Handler struct {
	hub *Hub
}

func NewHandler(h *Hub) *Handler {
	return &Handler{
		hub: h,
	}
}

type CreateRoomReq struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (h *Handler) CreateRoom(w http.ResponseWriter, r *http.Request) {
	var req CreateRoomReq

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	h.hub.Rooms[req.ID] = &Room{
		ID:      req.ID,
		Name:    req.Name,
		Clients: make(map[string]*Client),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(req); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *Handler) JoinRoom(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	roomID := r.PathValue("roomId")
	clientID := r.URL.Query().Get("userId")
	username := r.URL.Query().Get("username")

	cl := &Client{
		Conn:     conn,
		Message:  make(chan *Message, 10),
		ID:       clientID,
		RoomID:   roomID,
		Username: username,
	}

	m := &Message{
		Content:  "A new user has joined the room",
		RoomID:   roomID,
		Username: username,
	}

	h.hub.Register <- cl
	h.hub.Broadcast <- m

	go cl.writeMessage()
	cl.readMessage(h.hub)
}
