package main

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/sankarshankar/go-chat/db"
	"github.com/sankarshankar/go-chat/internal/user"
	"github.com/sankarshankar/go-chat/internal/ws"
	"github.com/sankarshankar/go-chat/router"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %s", err)
	}

	dbConn, err := db.NewDatabase()
	if err != nil {
		log.Fatalf("Could not initilize database connection: %s", err)
	}

	userRep := user.NewRepository(dbConn.GetDB())
	userSvc := user.NewService(userRep)
	userHandler := user.NewHandler(userSvc)

	hub := ws.NewHub()
	wsHandler := ws.NewHandler(hub)
	go hub.Run()

	router.InitRouter(userHandler, wsHandler)
	router.Start("0.0.0.0:8080")
}
