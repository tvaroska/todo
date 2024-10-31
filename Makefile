.PHONY: build up down logs

build:
	cd backend && docker build -t todo-backend .

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f
