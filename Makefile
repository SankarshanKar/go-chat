run: build
	@./bin/go-chat

build:
	@go build -o bin/go-chat ./cmd/
