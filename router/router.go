package router

import (
	"net/http"

	"github.com/sankarshankar/go-chat/internal/user"
	"github.com/sankarshankar/go-chat/internal/ws"
)

var mux *http.ServeMux

func InitRouter(userHandler *user.Handler, wsHandler *ws.Handler) {
	mux = http.NewServeMux()
	mux.HandleFunc("POST /signup", userHandler.CreateUser)
	mux.HandleFunc("POST /login", userHandler.Login)
	mux.HandleFunc("GET /logout", userHandler.Logout)

	mux.HandleFunc("POST /ws/createRoom", wsHandler.CreateRoom)
}

func Start(addr string) error {
	return http.ListenAndServe(addr, mux)
}
