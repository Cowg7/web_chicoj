# Makefile para facilitar comandos comunes del proyecto Chicoj

.PHONY: help setup deploy up down restart logs status backup restore clean

# Color output
BLUE := \033[0;34m
GREEN := \033[0;32m
NC := \033[0m

help: ## Mostrar esta ayuda
	@echo "$(BLUE)========================================$(NC)"
	@echo "$(BLUE)  Sistema Chicoj - Comandos Disponibles$(NC)"
	@echo "$(BLUE)========================================$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

setup: ## Configurar el servidor por primera vez
	@echo "$(BLUE)Configurando servidor...$(NC)"
	chmod +x setup-server.sh
	sudo ./setup-server.sh

deploy: ## Hacer deployment completo
	@echo "$(BLUE)Iniciando deployment...$(NC)"
	chmod +x deploy.sh
	./deploy.sh

up: ## Iniciar todos los servicios
	@echo "$(BLUE)Iniciando servicios...$(NC)"
	docker compose up -d

down: ## Detener todos los servicios
	@echo "$(BLUE)Deteniendo servicios...$(NC)"
	docker compose down

restart: ## Reiniciar todos los servicios
	@echo "$(BLUE)Reiniciando servicios...$(NC)"
	docker compose restart

logs: ## Ver logs de todos los servicios
	docker compose logs -f --tail=100

logs-backend: ## Ver logs del backend
	docker compose logs -f --tail=100 backend

logs-frontend: ## Ver logs del frontend
	docker compose logs -f --tail=100 frontend

logs-db: ## Ver logs de la base de datos
	docker compose logs -f --tail=100 postgres

status: ## Ver estado del sistema
	@chmod +x scripts/status.sh
	@./scripts/status.sh

ps: ## Ver contenedores en ejecución
	docker compose ps

backup: ## Hacer backup de la base de datos
	@chmod +x scripts/backup.sh
	@./scripts/backup.sh

restore: ## Restaurar backup (uso: make restore FILE=backup.sql.gz)
	@chmod +x scripts/restore.sh
	@./scripts/restore.sh $(FILE)

update: ## Actualizar el sistema
	@chmod +x scripts/update.sh
	@./scripts/update.sh

build: ## Reconstruir imágenes Docker
	@echo "$(BLUE)Reconstruyendo imágenes...$(NC)"
	docker compose build --no-cache

rebuild: build up ## Reconstruir e iniciar servicios

clean: ## Limpiar contenedores, imágenes y volúmenes no usados
	@echo "$(BLUE)Limpiando recursos Docker...$(NC)"
	docker compose down -v
	docker system prune -af

shell-backend: ## Entrar al contenedor del backend
	docker compose exec backend sh

shell-db: ## Entrar al contenedor de PostgreSQL
	docker compose exec postgres psql -U postgres restaurante_db

migrate: ## Ejecutar migraciones de base de datos
	docker compose exec backend npx prisma migrate deploy

seed: ## Ejecutar seed de base de datos
	docker compose exec backend npm run db:seed

dev-backend: ## Iniciar backend en modo desarrollo (sin Docker)
	cd Chicoj_System_R-T/backend && npm run dev

dev-frontend: ## Iniciar frontend en modo desarrollo (sin Docker)
	cd chicoj-frontend && npm run dev

install: ## Instalar dependencias (desarrollo local)
	@echo "$(BLUE)Instalando dependencias del backend...$(NC)"
	cd Chicoj_System_R-T/backend && npm install
	@echo "$(BLUE)Instalando dependencias del frontend...$(NC)"
	cd chicoj-frontend && npm install

check: ## Verificar estado de salud de los servicios
	@echo "$(BLUE)Verificando servicios...$(NC)"
	@docker compose ps
	@echo ""
	@echo "$(BLUE)Health checks:$(NC)"
	@docker inspect --format='{{.Name}}: {{.State.Health.Status}}' chicoj-backend 2>/dev/null || echo "backend: no health check"
	@docker inspect --format='{{.Name}}: {{.State.Health.Status}}' chicoj-frontend 2>/dev/null || echo "frontend: no health check"
	@docker inspect --format='{{.Name}}: {{.State.Health.Status}}' chicoj-postgres 2>/dev/null || echo "postgres: no health check"

stats: ## Ver estadísticas de uso de recursos
	docker stats --no-stream

env: ## Crear archivo .env desde ejemplo
	@if [ ! -f .env ]; then \
		cp env.example .env; \
		echo "$(GREEN)Archivo .env creado. Por favor edítalo con tus valores.$(NC)"; \
	else \
		echo "$(GREEN)El archivo .env ya existe.$(NC)"; \
	fi

init: env ## Inicializar proyecto (crear .env)
	@echo "$(GREEN)Proyecto inicializado.$(NC)"
	@echo "$(BLUE)Siguiente paso: edita el archivo .env con tus valores.$(NC)"

.DEFAULT_GOAL := help

