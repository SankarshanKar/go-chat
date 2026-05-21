package ws

import "sync"

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

func NewHub() *Hub {
	return &Hub{
		Rooms:      make(map[string]*Room),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Broadcast:  make(chan *Message),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case cl := <-h.Register:
			h.mu.Lock()
			if r, ok := h.Rooms[cl.RoomID]; ok {
				if _, ok := r.Clients[cl.ID]; !ok {
					r.Clients[cl.ID] = cl
				}
			}
			h.mu.Unlock()

		case cl := <-h.Unregister:
			h.mu.Lock()
			if r, ok := h.Rooms[cl.RoomID]; ok {
				if _, ok := r.Clients[cl.ID]; ok {
					delete(r.Clients, cl.ID)
					close(cl.Message)
					h.mu.Unlock()

					h.Broadcast <- &Message{
						Content:  "User left the chat",
						RoomID:   cl.RoomID,
						Username: cl.Username,
					}
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
			clients := make([]*Client, 0, len(r.Clients))
			for _, cl := range r.Clients {
				clients = append(clients, cl)
			}
			h.mu.RUnlock()

			for _, cl := range clients {
				cl.Message <- m
			}
		}
	}
}
