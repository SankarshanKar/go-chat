package main

import (
	"log"

	"github.com/sankarshankar/go-chat/db"
)

func main() {
	_, err := db.NewDatabase()
	if err != nil {
		log.Fatalf("Could not initilize database connection: %s", err)
	}
}
