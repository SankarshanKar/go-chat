package ws

import (
	"log"
	"sync"
)

type Room struct {
	ID      string             `json:"id"`
	Name    string             `json:"name"`
	Clients map[string]*Client `json:"clients"`
}

type Hub struct {
	mu    sync.RWMutex
	Rooms map[string]*Room

	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan *Message
}

type MessageType string

const (
	MessageTypeChat    MessageType = "chat"
	MessageTypeClients MessageType = "clients"
)

type Message struct {
	Type     MessageType `json:"type"`
	Content  string      `json:"content,omitempty"`
	RoomID   string      `json:"roomId,omitempty"`
	Username string      `json:"username,omitempty"`
	Clients  []ClientRes `json:"clients,omitempty"`
}

func NewHub() *Hub {
	return &Hub{
		Rooms:      make(map[string]*Room),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *Message),
	}
}

func (h *Hub) Run() {
	defer func() {
		if err := recover(); err != nil {
			log.Printf("hub: recovered from panic: %v", err)
			go h.Run()
		}
	}()

	for {
		select {
		case cl := <-h.Register:
			h.mu.Lock()
			if r, ok := h.Rooms[cl.RoomID]; ok {
				if _, ok := r.Clients[cl.ID]; !ok {
					r.Clients[cl.ID] = cl
				}
				h.broadcastClients(r)
			}
			h.mu.Unlock()

		case cl := <-h.Unregister:
			h.mu.Lock()
			if r, ok := h.Rooms[cl.RoomID]; ok {
				if _, ok := r.Clients[cl.ID]; ok {
					delete(r.Clients, cl.ID)
					h.broadcastClients(r)
					close(cl.Message)
					h.mu.Unlock()

					go func() {
						h.Broadcast <- &Message{
							Type:     MessageTypeChat,
							Content:  "User left the chat",
							RoomID:   cl.RoomID,
							Username: cl.Username,
						}
					}()
					continue
				}
			}
			h.mu.Unlock()

		case m := <-h.Broadcast:
			h.mu.RLock()
			r, ok := h.Rooms[m.RoomID]
			if !ok {
				h.mu.RUnlock()
				continue
			}
			for _, cl := range r.Clients {
				select {
				case cl.Message <- m:
				default:
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) Stats() (rooms int, clients int) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	rooms = len(h.Rooms)
	for _, r := range h.Rooms {
		clients += len(r.Clients)
	}
	return
}

func (h *Hub) broadcastClients(r *Room) {
	clients := make([]ClientRes, 0, len(r.Clients))
	for _, c := range r.Clients {
		clients = append(clients, ClientRes{
			ID:       c.ID,
			Username: c.Username,
		})
	}

	msg := &Message{
		Type:    MessageTypeClients,
		Clients: clients,
	}

	for _, cl := range r.Clients {
		select {
		case cl.Message <- msg:
		default:
		}
	}
}
