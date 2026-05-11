package router

import (
	"net/http"

	"github.com/sankarshankar/go-chat/internal/user"
)

var mux *http.ServeMux

func InitRouter(userHandler *user.Handler) {
	mux = http.NewServeMux()
	mux.HandleFunc("POST /signup", userHandler.CreateUser)
}

func Start(addr string) error {
	return http.ListenAndServe(addr, mux)
}
