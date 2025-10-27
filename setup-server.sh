#!/bin/bash

# ================================
# SCRIPT DE CONFIGURACIÓN INICIAL DEL SERVIDOR
# Para Ubuntu 22.04 en DigitalOcean
# ================================

set -e  # Salir si hay algún error

echo "================================"
echo "CHICOJ SERVER SETUP"
echo "Ubuntu 22.04 - DigitalOcean"
echo "================================"
echo ""

# Verificar que se ejecuta como root o con sudo
if [[ $EUID -ne 0 ]]; then
   echo "Este script debe ejecutarse como root o con sudo"
   exit 1
fi

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# 1. Actualizar sistema
print_info "Actualizando el sistema..."
apt-get update
apt-get upgrade -y
print_success "Sistema actualizado"

# 2. Instalar paquetes necesarios
print_info "Instalando paquetes necesarios..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    htop \
    nano \
    wget
print_success "Paquetes instalados"

# 3. Instalar Docker
print_info "Instalando Docker..."
if ! command -v docker &> /dev/null; then
    # Agregar repositorio de Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-buildx-plugin
    
    # Iniciar Docker
    systemctl start docker
    systemctl enable docker
    
    print_success "Docker instalado"
else
    print_success "Docker ya está instalado"
fi

# 4. Instalar/Verificar Docker Compose Plugin
print_info "Verificando Docker Compose..."
if ! docker compose version &> /dev/null; then
    print_info "Docker Compose no está instalado. Instalando..."
    
    # Instalar Docker Compose Plugin
    apt-get update
    apt-get install -y docker-compose-plugin docker-buildx-plugin
    
    # Verificar instalación
    if docker compose version &> /dev/null; then
        print_success "Docker Compose instalado correctamente"
    else
        print_error "Error al instalar Docker Compose"
        print_info "Intentando método alternativo..."
        
        # Método alternativo: instalar manualmente
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
        mkdir -p /usr/local/lib/docker/cli-plugins
        curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
            -o /usr/local/lib/docker/cli-plugins/docker-compose
        chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
        
        if docker compose version &> /dev/null; then
            print_success "Docker Compose instalado correctamente (método alternativo)"
        else
            print_error "No se pudo instalar Docker Compose. Por favor instálalo manualmente."
            exit 1
        fi
    fi
else
    print_success "Docker Compose ya está instalado"
fi

# 5. Verificar instalación de Docker
echo ""
print_info "Versiones instaladas:"
docker --version
docker compose version
echo ""

# 6. Crear usuario para deployment (opcional pero recomendado)
print_info "Creando usuario 'chicoj' para deployment..."
if ! id -u chicoj &>/dev/null; then
    useradd -m -s /bin/bash chicoj
    usermod -aG docker chicoj
    print_success "Usuario 'chicoj' creado"
else
    print_info "Usuario 'chicoj' ya existe"
    usermod -aG docker chicoj
fi

# 7. Configurar firewall
print_info "Configurando firewall UFW..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH
ufw allow 22/tcp comment 'SSH'

# Permitir HTTP y HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Opcional: PostgreSQL (solo si quieres acceso externo)
# ufw allow 5432/tcp comment 'PostgreSQL'

ufw reload
print_success "Firewall configurado"

# 8. Configurar swap (recomendado para VPS pequeños)
print_info "Configurando swap..."
if [ ! -f /swapfile ]; then
    # Crear swap de 2GB
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    print_success "Swap de 2GB creado"
else
    print_info "Swap ya existe"
fi

# 9. Optimizar configuración del kernel para Docker
print_info "Optimizando configuración del kernel..."
cat >> /etc/sysctl.conf <<EOF

# Optimizaciones para Docker
vm.max_map_count=262144
fs.file-max=65536
net.core.somaxconn=65535
net.ipv4.tcp_max_syn_backlog=8096
EOF

sysctl -p
print_success "Kernel optimizado"

# 10. Crear directorio para la aplicación
print_info "Creando directorio para la aplicación..."
mkdir -p /opt/chicoj
chown chicoj:chicoj /opt/chicoj
print_success "Directorio creado: /opt/chicoj"

# 11. Configurar logrotate para Docker
print_info "Configurando logrotate para Docker..."
cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

systemctl restart docker
print_success "Logrotate configurado"

# 12. Instalar fail2ban (protección contra ataques)
print_info "Instalando fail2ban..."
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
print_success "Fail2ban instalado"

# 13. Configurar timezone
print_info "Configurando timezone..."
timedatectl set-timezone America/Guatemala
print_success "Timezone configurado a America/Guatemala"

echo ""
print_success "================================"
print_success "CONFIGURACIÓN COMPLETADA"
print_success "================================"
echo ""
print_info "Próximos pasos:"
echo "1. Clonar el repositorio en /opt/chicoj:"
echo "   cd /opt/chicoj"
echo "   git clone [URL_DEL_REPO] ."
echo ""
echo "2. Configurar variables de entorno:"
echo "   cp env.example .env"
echo "   nano .env"
echo ""
echo "3. Ejecutar el deployment:"
echo "   ./deploy.sh"
echo ""
print_info "Estado del firewall:"
ufw status numbered
echo ""
print_info "Usuario 'chicoj' creado. Para cambiar a este usuario:"
echo "   su - chicoj"
echo ""

