#!/bin/bash

# ================================================
# Script para Gestionar PgAdmin
# Chicoj Restaurant System
# ================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════╗
║        Gestión de PgAdmin - Chicoj           ║
╚═══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz del proyecto"
    exit 1
fi

# Menú
echo ""
print_info "¿Qué quieres hacer con PgAdmin?"
echo ""
echo "1) Iniciar PgAdmin"
echo "2) Detener PgAdmin"
echo "3) Reiniciar PgAdmin"
echo "4) Ver estado de PgAdmin"
echo "5) Ver logs de PgAdmin"
echo "6) Abrir PgAdmin en navegador"
echo "0) Salir"
echo ""
read -p "Selecciona una opción (0-6): " option

case $option in
    1)
        print_info "Iniciando PgAdmin..."
        docker-compose --profile debug up -d pgadmin
        sleep 3
        if docker-compose ps | grep -q "pgadmin.*Up"; then
            print_success "PgAdmin iniciado correctamente"
            print_info "Accede en: http://165.227.103.238:5050"
        else
            print_error "Error al iniciar PgAdmin"
        fi
        ;;
    2)
        print_info "Deteniendo PgAdmin..."
        docker-compose --profile debug stop pgadmin
        if ! docker-compose ps | grep -q "pgadmin.*Up"; then
            print_success "PgAdmin detenido correctamente"
        else
            print_error "Error al detener PgAdmin"
        fi
        ;;
    3)
        print_info "Reiniciando PgAdmin..."
        docker-compose --profile debug restart pgadmin
        sleep 3
        if docker-compose ps | grep -q "pgadmin.*Up"; then
            print_success "PgAdmin reiniciado correctamente"
        else
            print_error "Error al reiniciar PgAdmin"
        fi
        ;;
    4)
        print_info "Estado de PgAdmin:"
        docker-compose ps pgadmin
        echo ""
        ;;
    5)
        print_info "Mostrando logs de PgAdmin (Ctrl+C para salir):"
        docker-compose --profile debug logs -f pgadmin
        ;;
    6)
        print_info "Abriendo PgAdmin en el navegador..."
        PgAdmin_URL="http://165.227.103.238:5050"
        if command -v xdg-open &> /dev/null; then
            xdg-open "$PgAdmin_URL"
        elif command -v open &> /dev/null; then
            open "$PgAdmin_URL"
        else
            print_warning "No se pudo abrir automáticamente. Abre manualmente:"
            print_info "$PgAdmin_URL"
        fi
        ;;
    0)
        print_info "Saliendo..."
        exit 0
        ;;
    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac

echo ""
print_info "Comando ejecutado"


